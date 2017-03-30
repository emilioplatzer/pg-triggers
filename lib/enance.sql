create or replace function enance_table(table_name text, primary_key_fields text) returns text
  language plpgsql as
$BODY$
declare
  v_sql text;
begin
  v_sql=replace(replace($sql$
    CREATE TRIGGER changes_trg
      AFTER INSERT OR UPDATE OR DELETE
      ON table_name
      FOR EACH ROW
      EXECUTE PROCEDURE his.changes_trg(primary_key_fields);
  $sql$
    ,'table_name', table_name)
    ,'primary_key_fields', primary_key_fields);
  execute v_sql;
  return 'ok';
end;
$BODY$;
