-- Customer privacy controls: private fiscal data, consent evidence, audit and LGPD requests.

create table if not exists public.customer_private_data (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  document text,
  document_last_digits text,
  legal_name text,
  state_registration text,
  retention_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  purpose text not null check (purpose in ('privacy_policy', 'terms_of_use', 'marketing')),
  document_version text not null,
  granted boolean not null,
  source text not null default 'account',
  request_fingerprint text,
  created_at timestamptz not null default now()
);

create table if not exists public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  request_type text not null check (request_type in ('export', 'deletion')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  requester_reference text not null,
  resolution_note text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists privacy_consents_profile_created_idx on public.privacy_consents (profile_id, created_at desc);
create index if not exists data_subject_requests_profile_created_idx on public.data_subject_requests (profile_id, requested_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);

alter table public.customer_private_data enable row level security;
alter table public.privacy_consents enable row level security;
alter table public.data_subject_requests enable row level security;
alter table public.admin_audit_logs enable row level security;

revoke all on public.customer_private_data from anon, authenticated;
revoke all on public.privacy_consents from anon, authenticated;
revoke all on public.data_subject_requests from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;

create or replace function public.audit_authenticated_staff_change()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  row_id text;
begin
  if auth.uid() is not null and public.is_staff() then
    row_id := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id', to_jsonb(new)->>'profile_id', to_jsonb(old)->>'profile_id');
    insert into public.admin_audit_logs (actor_profile_id, action, target_table, target_id)
    values (auth.uid(), lower(tg_op), tg_table_name, row_id);
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists audit_staff_profiles on public.profiles;
create trigger audit_staff_profiles after insert or update or delete on public.profiles
for each row execute function public.audit_authenticated_staff_change();
drop trigger if exists audit_staff_orders on public.orders;
create trigger audit_staff_orders after insert or update or delete on public.orders
for each row execute function public.audit_authenticated_staff_change();
drop trigger if exists audit_staff_payments on public.payments;
create trigger audit_staff_payments after insert or update or delete on public.payments
for each row execute function public.audit_authenticated_staff_change();

create or replace function public.anonymize_customer_data(target_profile_id uuid, resolved_by uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare
  requester_hash text;
begin
  if coalesce(auth.role(), 'postgres') not in ('service_role', 'postgres') then
    raise exception 'server-only operation';
  end if;

  requester_hash := encode(digest(target_profile_id::text, 'sha256'), 'hex');
  update public.orders set
    profile_id = null,
    customer_name = 'Cliente anonimizado',
    customer_email = 'anon-' || left(requester_hash, 16) || '@invalid.local',
    customer_phone = '',
    address = '{}'::jsonb
  where profile_id = target_profile_id;

  delete from public.addresses where profile_id = target_profile_id;
  delete from public.customer_private_data where profile_id = target_profile_id;
  update public.privacy_consents set profile_id = null where profile_id = target_profile_id;
  update public.data_subject_requests set
    profile_id = null,
    requester_reference = requester_hash,
    status = case when request_type = 'deletion' and status in ('pending', 'processing') then 'completed' else status end,
    completed_at = case when request_type = 'deletion' and status in ('pending', 'processing') then now() else completed_at end
  where profile_id = target_profile_id;
  update public.profiles set name = 'Cliente anonimizado', email = null, phone = null, document = null where id = target_profile_id;

  insert into public.admin_audit_logs (actor_profile_id, action, target_table, target_id, metadata)
  values (resolved_by, 'anonymize', 'profiles', requester_hash, jsonb_build_object('personal_data_removed', true));
end;
$$;

revoke all on function public.anonymize_customer_data(uuid, uuid) from public, anon, authenticated;
grant execute on function public.anonymize_customer_data(uuid, uuid) to service_role;

