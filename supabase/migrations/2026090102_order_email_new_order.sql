alter table public.order_email_notifications
  drop constraint if exists order_email_notifications_event_type_check;
alter table public.order_email_notifications
  add constraint order_email_notifications_event_type_check
  check (event_type in ('new_order', 'payment_approved', 'status_changed'));
