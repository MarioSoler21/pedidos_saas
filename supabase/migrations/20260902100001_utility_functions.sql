-- =============================================================================
-- 001 - Funciones utilitarias
-- =============================================================================
-- Trigger generico para mantener updated_at en cada UPDATE. Se reutiliza en
-- toda tabla que tenga la columna updated_at.
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger generico: actualiza updated_at = now() en cada UPDATE de la fila.';
