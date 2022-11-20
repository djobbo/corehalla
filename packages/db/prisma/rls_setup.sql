-- Add row level security

-- User Profile

alter table public."UserProfile"
  enable row level security;

drop policy if exists "User can view own profile" on public."UserProfile";
create policy "User can view own profile" 
    on public."UserProfile" for select 
    using ( auth.uid() = id );

drop policy if exists "User can create own profile" on public."UserProfile";
create policy "User can create own profile" 
    on public."UserProfile" for insert 
    with check ( auth.uid() = id );

drop policy if exists "User can edit own profile" on public."UserProfile";
create policy "User can edit own profile" 
    on public."UserProfile" for update 
    using ( auth.uid() = id );

-- User Connection

alter table public."UserConnection"
  enable row level security;

drop policy if exists "User can view own connections" on public."UserConnection";
create policy "User can view own connections" 
    on public."UserConnection" for select 
    using ( auth.uid() = "userId" );

drop policy if exists "User can create own connections" on public."UserConnection";
create policy "User can create own connections" 
    on public."UserConnection" for insert 
    with check ( auth.uid() = "userId" );

drop policy if exists "User can edit own connections" on public."UserConnection";
create policy "User can edit own connections" 
    on public."UserConnection" for update 
    using ( auth.uid() = "userId" );

-- TODO: Add rls for deleting connections

-- User Favorite

alter table public."UserFavorite"
  enable row level security;

drop policy if exists "User can view own favorites" on public."UserFavorite";
create policy "User can view own favorites" 
    on public."UserFavorite" for select 
    using ( auth.uid() = "userId" );

drop policy if exists "User can create own favorites" on public."UserFavorite";
create policy "User can create own favorites" 
    on public."UserFavorite" for insert 
    with check ( auth.uid() = "userId" );

drop policy if exists "User can edit own favorites" on public."UserFavorite";
create policy "User can edit own favorites" 
    on public."UserFavorite" for update 
    using ( auth.uid() = "userId" );

drop policy if exists "User can delete own favorites" on public."UserFavorite";
create policy "User can delete own favorites" 
    on public."UserFavorite" for delete 
    using ( auth.uid() = "userId" );

-- Brawlhalla

-- Player
alter table public."BHPlayerData"
  enable row level security;
alter table public."BHPlayerLegend"
  enable row level security;
alter table public."BHPlayerWeapon"
  enable row level security;

alter table public."BHPlayerAlias"
  enable row level security;

-- Clan
alter table public."BHClan"
  enable row level security;

-- Crawler
alter table public."CrawlProgress"
  enable row level security;