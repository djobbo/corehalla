-- Setup supabase realtime

begin;
    drop publication if exists supabase_realtime; 

    create publication supabase_realtime 
        for table public."UserProfile", public."UserFavorite", public."UserConnection";
commit;
