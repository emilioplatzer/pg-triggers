create table tri.people(
  name text primary key,
  age integer
);

CREATE TRIGGER changes_trg
  AFTER INSERT OR UPDATE OR DELETE
  ON tri.people
  FOR EACH ROW
  EXECUTE PROCEDURE his.changes_trg(/*array['name']*/);
