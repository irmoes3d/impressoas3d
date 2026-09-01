-- Durable, server-only delivery log used to prevent duplicate customer emails.
create table if not exists public.order_email_notifications (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  event_key text not null unique,
  event_type text not null check (event_type in ('payment_approved', 'status_changed')),
  recipient text not null,
  order_status text,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists order_email_notifications_order_idx
  on public.order_email_notifications (order_id, created_at desc);

alter table public.order_email_notifications enable row level security;
revoke all on public.order_email_notifications from anon, authenticated;
