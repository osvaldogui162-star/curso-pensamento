-- ============================================================
-- Pagamentos: pedidos de validação + comprovativos + aprovação
-- ============================================================

-- 1) Tabela de pedidos de pagamento (aluno -> admin)
create table if not exists public.payment_requests (
  id bigserial primary key,
  user_id uuid not null,
  course_id bigint not null,
  method text not null check (method in ('receipt_upload','reference')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  amount numeric null,
  receipt_path text null,
  reference_code text null,
  note text null,
  reviewed_by uuid null,
  reviewed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_requests_user on public.payment_requests (user_id);
create index if not exists idx_payment_requests_course on public.payment_requests (course_id);
create index if not exists idx_payment_requests_status on public.payment_requests (status);

-- Evita múltiplos pendentes para o mesmo usuário/curso.
-- (parcial) precisa ser recriado se já existir constraint similar.
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'uniq_payment_requests_pending_user_course'
  ) then
    execute 'create unique index uniq_payment_requests_pending_user_course
             on public.payment_requests (user_id, course_id)
             where status = ''pending''';
  end if;
end $$;

-- 2) Ajuste recomendado: garantir 1 matrícula por usuário/curso (opcional)
do $$ begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'uniq_enrollments_user_course'
  ) then
    execute 'create unique index uniq_enrollments_user_course
             on public.enrollments (user_id, course_id)';
  end if;
end $$;

-- 3) Storage
-- Crie os buckets no painel do Supabase (Storage -> Buckets):
-- - course_pdfs (já usado para PDFs dos módulos)
-- - payment_receipts (para comprovativos)
--
-- Se quiser manter privado, deixe privado e use URL assinada (o backend faz).
--
-- 4) RLS
-- Como o backend usa SERVICE ROLE KEY, ele bypassa RLS.
-- Se desejar permitir upload direto do cliente (não recomendado), precisaria de políticas aqui.

