-- Payment hardening: all financial writes are server-only and provider events are auditable.

alter table public.payments add column if not exists provider text;
alter table public.payments add column if not exists provider_payment_id text;
alter table public.payments add column if not exists provider_external_reference text;
alter table public.payments add column if not exists verified_at timestamptz;

create unique index if not exists payments_provider_payment_id_key
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_request_id text not null,
  provider_payment_id text not null,
  event_type text not null,
  payload_hash text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_request_id)
);

alter table public.payment_webhook_events enable row level security;

-- Public clients may read only the rows already allowed by RLS. They cannot create
-- orders with forged totals or mutate any payment record.
drop policy if exists "orders_insert_own" on public.orders;
revoke insert on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
revoke insert, update, delete on public.payments from anon, authenticated;
revoke all on public.payment_webhook_events from anon, authenticated;

create or replace function public.reject_untrusted_financial_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), 'postgres') not in ('service_role', 'postgres') then
    if tg_table_name = 'payments' then
      raise exception 'payment records are server-managed';
    end if;

    if old.subtotal is distinct from new.subtotal
      or old.discount is distinct from new.discount
      or old.shipping_cost is distinct from new.shipping_cost
      or old.total is distinct from new.total
      or old.payment_method is distinct from new.payment_method
      or old.payment_status is distinct from new.payment_status then
      raise exception 'financial fields are server-managed';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists reject_untrusted_order_financial_changes on public.orders;
create trigger reject_untrusted_order_financial_changes
before update on public.orders
for each row execute function public.reject_untrusted_financial_changes();

drop trigger if exists reject_untrusted_payment_changes on public.payments;
create trigger reject_untrusted_payment_changes
before insert or update or delete on public.payments
for each row execute function public.reject_untrusted_financial_changes();
