-- Setup supabase realtime

alter publication supabase_realtime add table public."UserProfile";
alter publication supabase_realtime add table public."UserFavorite";
alter publication supabase_realtime add table public."UserConnection";