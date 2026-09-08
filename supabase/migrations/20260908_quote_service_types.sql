alter table public.custom_quotes
  add column if not exists service_type text not null default 'impressao_3d';

alter table public.custom_quotes
  drop constraint if exists custom_quotes_service_type_check;

alter table public.custom_quotes
  add constraint custom_quotes_service_type_check
  check (service_type in ('impressao_3d', 'corte_laser', 'trofeus_personalizados'));
