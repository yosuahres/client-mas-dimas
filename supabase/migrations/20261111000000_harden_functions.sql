-- Pin the search path of the helper functions, so neither can be made to resolve a name through a schema
-- someone else controls. is_admin() decides every write policy; it only uses the schema-qualified auth.jwt().

alter function public.is_admin() set search_path = '';
alter function public.touch_updated_at() set search_path = '';

-- The trigger function is only ever run by its triggers, which don't need this grant; without it the function
-- is no longer exposed through the API. is_admin() keeps its grant: policies run it as the querying role.
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
