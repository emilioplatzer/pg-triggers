<!--multilang v0 es:LEEME.md en:README.md -->
# pg-triggers
<!--lang:es-->
Triggers for postgres
<!--lang:en--]
Triggers for postgres

[!--lang:*-->

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)
[![downloads](https://img.shields.io/npm/dm/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)

<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->
# Instalación
<!--lang:en--]
# Install
[!--lang:*-->
```sh
$ psql < lib/recreate-his.sql
$ psql < lib/table-changes.sql
$ psql < lib/function-changes-trg.sql
```

<!--lang:es-->
# Configuración
<!--lang:en--]
# Config
[!--lang:*-->
```sh
$ psql < lib/enance.sql
$ psql -c "select enance_table('state','country,state')"
```
<!--lang:es-->
La función `enance_table` recibe el nombre de una tabla y los nombres de los campos de su clave primary y crean los triggers necesarios.

Debe llamarse a la función para cada tabla a la que se desee agregarle auditoría.

Se puede borrar la función enance_tables una vez terminada la configuración. Si alguna tabla cambia su clave principal debe llamarse nuevamene a la función `enance_table`

La función por defecto audita inserts, udpates y deletes. Pero existe un tercer parametro **method** el cual es opcional. Si se le pasa el valor 'ud' no auditará inserciones (solo cambios de update y delete)
<!--lang:en--]
You must call enance_table(table_name, primary_key_fields) for each table that you want to audit changes on each time you create a table or alter the primary key. 

<!--lang:es-->
# Desarrollo
<!--lang:en--]
# Devel
[!--lang:*-->
```sh
$ npm install
$ psql --file install/create_db.sql
$ npm test
```

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

