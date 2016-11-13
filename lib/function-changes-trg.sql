create or replace function his.changes_trg() 
  returns trigger
  language plpgsql
as
$BODY$
declare
  -- p_primary_key_values text[]:=tg_argv[0];
  p_primary_key_values text[]:=array['name'];
  v_new_pk jsonb;
  v_old_pk jsonb;
  v_new_value text;
  v_old_value text;
  v_new_values jsonb;
  v_old_values jsonb;
  v_column text;
  v_new_pk_values jsonb:='{}';
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    v_new_pk:='{}';
    v_new_values:=to_jsonb(new);
    foreach v_column in array p_primary_key_values 
    loop
      v_new_pk:=jsonb_set(v_new_pk, array[v_column], v_new_values #> array[v_column]);
    end loop;
  else
    v_new_values:='{}';
  end if;
  if tg_op = 'DELETE' or tg_op = 'UPDATE' then
    v_old_pk:='{}';
    v_old_values:=to_jsonb(old);
    foreach v_column in array p_primary_key_values 
    loop
      v_old_pk:=jsonb_set(v_old_pk, array[v_column], v_old_values -> v_column);
    end loop;
  else
    v_old_values:='{}';
  end if;
  if tg_op = 'INSERT' OR tg_op = 'UPDATE' then
    for v_column in select jsonb_object_keys(v_new_values) 
    loop
      if v_new_values -> v_column is distinct from v_old_values -> v_column then
          insert into "his".changes 
            (cha_schema     , cha_table    , cha_new_pk, cha_column, cha_op, cha_new_value           , cha_old_value           , cha_who, cha_when         ) values
            (tg_table_schema, tg_table_name, v_new_pk  , v_column  , tg_op , v_new_values -> v_column, v_old_values -> v_column, user   , clock_timestamp());
      end if;
    end loop;
  end if;
  return new;
end;
$BODY$;