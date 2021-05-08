create table tri.people(
  name text primary key,
  age integer,
  quit timestamp with time zone,
  active boolean default true
);

/*
CREATE TRIGGER changes_trg
  AFTER INSERT OR UPDATE OR DELETE
  ON tri.people
  FOR EACH ROW
  EXECUTE PROCEDURE his.changes_trg('name');
*/