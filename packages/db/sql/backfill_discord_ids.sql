-- One-time backfill for databases that predate app-owned auth.
--
-- Supabase Auth stored the Discord snowflake in `auth.identities.provider_id`.
-- Copying it onto the matching profile lets those users be recognised by
-- `discordId` on their next sign-in, so their favourites and connections are
-- preserved. No-op on fresh databases and on plain Postgres.
do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'UserProfile'
          and column_name = 'discordId'
    ) and exists (
        select 1
        from information_schema.tables
        where table_schema = 'auth' and table_name = 'identities'
    ) then
        update public."UserProfile" as profile
        set "discordId" = identity.provider_id
        from auth.identities as identity
        where identity.user_id = profile.id
          and identity.provider = 'discord'
          and profile."discordId" is null;
    end if;
end
$$;
