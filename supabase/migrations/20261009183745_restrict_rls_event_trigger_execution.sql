-- Supabase's optional RLS event trigger runs for database administrators.
-- API roles have no reason to execute this SECURITY DEFINER function.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
