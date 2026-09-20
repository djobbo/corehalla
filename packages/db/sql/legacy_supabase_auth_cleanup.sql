-- Retire the Supabase Auth / RLS / Realtime integration.
--
-- Supabase now only hosts Postgres: the application connects directly and
-- enforces authorization in the server layer, so the objects Supabase's
-- GoTrue/PostgREST/Realtime stack used to provide are no longer meaningful.
-- Every statement is idempotent and a no-op against a plain Postgres (local
-- development no longer starts those services).

-- 1. Drop the auth.users -> public."UserProfile" bridge installed by the old
--    `auth_user_trigger_add.sql`.
do $$
begin
    if exists (
        select 1
        from information_schema.tables
        where table_schema = 'auth' and table_name = 'users'
    ) then
        execute 'drop trigger if exists create_profile_for_new_user_trigger on auth.users';
    end if;
end
$$;

--> statement-breakpoint
drop function if exists public.create_profile_for_new_user()

--> statement-breakpoint
alter table if exists public."UserProfile"
    drop constraint if exists "UserProfile_userId_fkey"

--> statement-breakpoint
-- 2. Remove the row level security policies that only evaluated Supabase JWT
--    claims via auth.uid().
do $$
declare
    target text;
    policy record;
begin
    foreach target in array array[
        'UserProfile',
        'UserFavorite',
        'UserConnection',
        'BHPlayerData',
        'BHPlayerLegend',
        'BHPlayerWeapon',
        'BHPlayerAlias',
        'BHClan',
        'CrawlProgress'
    ]
    loop
        if to_regclass('public.' || quote_ident(target)) is not null then
            execute format('alter table public.%I disable row level security', target);

            for policy in
                select policyname
                from pg_policies
                where schemaname = 'public' and tablename = target
            loop
                execute format(
                    'drop policy if exists %I on public.%I',
                    policy.policyname,
                    target
                );
            end loop;
        end if;
    end loop;
end
$$;

--> statement-breakpoint
-- 3. Drop the Realtime publication (the browser no longer subscribes to
--    postgres_changes).
do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        execute 'drop publication supabase_realtime';
    end if;
end
$$;
