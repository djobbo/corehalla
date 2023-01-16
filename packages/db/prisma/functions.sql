create or replace function search_aliases(search text, aliases_offset integer, aliases_per_page integer)
returns setof public."BHPlayerAlias"
language plpgsql
as $$
begin
return query
    select *
    from public."BHPlayerAlias"
    where "playerId"
    in (
        select "playerId"
        from public."BHPlayerAlias"
        where "alias" ILIKE search||'%' and "public" is TRUE
        order by "createdAt" desc
        limit aliases_per_page
        offset aliases_offset
    )
    and "public" is TRUE
    order by "createdAt" desc;
end;
$$;
