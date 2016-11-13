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
  v_new_value jsonb;
  v_old_value jsonb;
  v_new_values jsonb;
  v_old_values jsonb;
  v_column text;
  v_new_pk_values jsonb:='{}';
  v_context text;
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
  select nullif(setting,'') into v_context from pg_settings where name='application_name';
  if tg_op = 'INSERT' OR tg_op = 'UPDATE' then
    for v_column in select jsonb_object_keys(v_new_values) 
    loop
      v_new_value = v_new_values -> v_column;
      v_old_value = v_old_values -> v_column;
      if v_old_value is null then
        v_old_value:='null'::jsonb;
      end if;
      if v_new_value is distinct from v_old_value then
        insert into "his".changes 
          (cha_schema     , cha_table    , cha_new_pk, cha_old_pk, cha_column, cha_op, cha_new_value, cha_old_value, cha_who, cha_when         , cha_context) values
          (tg_table_schema, tg_table_name, v_new_pk  , v_old_pk  , v_column  , tg_op , v_new_value  , v_old_value  , user   , clock_timestamp(), v_context  );
      end if;
    end loop;
    return new;
  else
    insert into "his".changes 
      (cha_schema     , cha_table    , cha_old_pk, cha_op, cha_old_value, cha_who, cha_when         , cha_context) values
      (tg_table_schema, tg_table_name, v_old_pk  , tg_op , v_old_values , user   , clock_timestamp(), v_context  );
    return null;
  end if;
end;
$BODY$;