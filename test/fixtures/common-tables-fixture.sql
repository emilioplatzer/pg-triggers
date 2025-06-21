create table tri.people(
  name text primary key,
  age integer,
  quit timestamp with time zone,
  active boolean default true
);

create table tri.animal(
  id integer primary key,
  name text
);