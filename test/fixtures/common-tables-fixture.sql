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

create table tri.food(
  id_animal integer references tri.animal(id),
  id integer,
  food text,
  primary key (id_animal, id)
);
