# pg-triggers
Triggers for postgres


![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)
[![downloads](https://img.shields.io/npm/dm/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

# Install
```sh
$ psql < lib/recreate-his.sql
$ psql < lib/table-changes.sql
$ psql < lib/function-changes-trg.sql
```

# Config
```sh
$ psql < lib/enance.sql
$ psql -c "select enance_table('state','country,state')"
```
You must call enance_table(table_name, primary_key_fields) for each table that you want to audit changes on each time you create a table or alter the primary key.

# Devel
```sh
$ npm install
$ psql --file install/create_db.sql
$ npm test
```

## License

[MIT](LICENSE)

