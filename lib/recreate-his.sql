DROP FUNCTION IF EXISTS enance_table(text, text);

DROP FUNCTION IF EXISTS his.changes_trg() /*CASCADE*/ /* REGEXP SECURE ADDABLE CASCADE */;

DROP TABLE IF EXISTS his."changes"; /* DONT ADD CASCADE HERE */

DO language plpgsql
$DO$
BEGIN
  DROP SCHEMA IF EXISTS his;
  EXCEPTION 
    WHEN dependent_objects_still_exist THEN
      RAISE NOTICE 'skipping DROP SCHEMA HIS because dependent_objects_still_exist';
END;
$DO$;

CREATE SCHEMA IF NOT EXISTS his;
