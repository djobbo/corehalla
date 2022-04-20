-- addforeignKey
alter table public."UserProfile" add constraint "UserProfile_userId_fkey" foreign key ("id") references auth.users("id") on delete restrict on update cascade;

-- create User Profile trigger function
create or replace function create_profile_for_new_user()
returns trigger 
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."UserProfile" (id)
  values(new.id) on conflict (id) do nothing;
  return new;
end;
$$;

-- create trigger on insert or Update
create or replace trigger create_profile_for_new_user_trigger
  after insert or update on auth.users
    for each row
    execute procedure create_profile_for_new_user();