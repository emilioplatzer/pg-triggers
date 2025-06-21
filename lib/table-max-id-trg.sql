create or replace function table_name_max_id_trg() returns trigger
  language plpgsql
as
$body$
declare
  curr_max bigint;
begin
  if new.id_name is null then
    select max(id_name) into curr_max
      from table_name;
    new.id_name := coalesce(curr_max + 1, 1);
  end if;
  return new;
end;
$body$;

create trigger table_name_max_id_trg 
  before insert
  on table_name
  for each row execute function table_name_max_id_trg();
