create table his."changes"(
  cha_schema text,
  cha_table text,
  cha_new_pk jsonb,
  cha_old_pk jsonb,
  cha_column text, 
  cha_op text,
  cha_new_value jsonb,
  cha_old_value jsonb,
  cha_who text,
  cha_when timestamp,
  cha_context text
);