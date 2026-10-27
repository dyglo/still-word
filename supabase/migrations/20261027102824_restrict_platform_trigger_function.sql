-- This platform-provided event trigger has no public RPC use.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
