create or replace function enance_table(table_name text, primary_key_fields text, method text default 'iud') returns text
  language plpgsql security definer as
$BODY$
declare
  v_sql text;
begin
  v_sql=replace($sql$
    DROP TRIGGER IF EXISTS changes_trg ON table_name
    DROP TRIGGER IF EXISTS changes_ud_trg ON table_name
  $sql$
    ,'table_name', table_name);
  execute v_sql;
  v_sql=replace(replace($sql$
    CREATE TRIGGER changes_trg
      AFTER INSERT OR UPDATE OR DELETE
      ON table_name
      FOR EACH ROW
      EXECUTE PROCEDURE his.changes_trg('primary_key_fields');
  $sql$
    ,'table_name', table_name)
    ,'primary_key_fields', primary_key_fields);
  if method = 'ud' then
    v_sql=replace(v_sql, 'AFTER INSERT OR UPDATE OR DELETE', 'AFTER UPDATE OR DELETE');
    v_sql=replace(v_sql, 'CREATE TRIGGER changes_trg', 'CREATE TRIGGER changes_ud_trg');
  end if;
  execute v_sql;
  return 'ok';
end;
$BODY$;
