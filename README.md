# pg-triggers
Triggers for postgres


[![npm-version](https://img.shields.io/npm/v/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)
[![downloads](https://img.shields.io/npm/dm/pg-triggers.svg)](https://npmjs.org/package/pg-triggers)
[![build](https://github.com/emilioplatzer/pg-triggers/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/emilioplatzer/pg-triggers/actions/workflows/build-and-test.yml)
[![coverage](https://img.shields.io/coveralls/emilioplatzer/pg-triggers/master.svg)](https://coveralls.io/r/emilioplatzer/pg-triggers)
[![sonar](https://sonarcloud.io/api/project_badges/measure?project=emilioplatzer_pg-triggers&metric=alert_status)](https://sonarcloud.io/summary/overall?id=emilioplatzer_pg-triggers)
[![qa-control](https://github.com/emilioplatzer/pg-triggers/actions/workflows/qa-control.yml/badge.svg)](https://github.com/emilioplatzer/pg-triggers/actions/workflows/qa-control.yml)


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
