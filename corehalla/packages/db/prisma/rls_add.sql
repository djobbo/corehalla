-- Add row level security

-- User Profile

alter table public.user_profiles
  enable row level security;

drop policy if exists "User can view own profile" on public.user_profiles;
create policy "User can view own profile" 
    on public.user_profiles for select 
    using ( auth.uid() = id );

drop policy if exists "User can create own profile" on public.user_profiles;
create policy "User can create own profile" 
    on public.user_profiles for insert 
    with check ( auth.uid() = id );

drop policy if exists "User can edit own profile" on public.user_profiles;
create policy "User can edit own profile" 
    on public.user_profiles for update 
    using ( auth.uid() = id );

-- User Connection

alter table public.user_connections
  enable row level security;

drop policy if exists "User can view own connections" on public.user_connections;
create policy "User can view own connections" 
    on public.user_connections for select 
    using ( auth.uid() = user_id );

drop policy if exists "User can create own connections" on public.user_connections;
create policy "User can create own connections" 
    on public.user_connections for insert 
    with check ( auth.uid() = user_id );

drop policy if exists "User can edit own connections" on public.user_connections;
create policy "User can edit own connections" 
    on public.user_connections for update 
    using ( auth.uid() = user_id );

-- TODO: Add rls for deleting connections