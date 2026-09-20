-- Setup supabase realtime

begin

--> statement-breakpoint
drop publication if exists supabase_realtime

--> statement-breakpoint
create publication supabase_realtime 
        for table public."UserProfile", public."UserFavorite", public."UserConnection"

--> statement-breakpoint
commit
