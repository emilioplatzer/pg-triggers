/// <reference path="./pg-triggers.d.ts" />
"use strict";

var fs = require("fs/promises");

var pgTriggers = {}

pgTriggers.table_name_max_id_trg = async function table_name_max_id_trg (tableName, idName) {
    var content = await fs.readFile(__dirname + "/table-max-id-trg.sql", "utf8");
    var sql = content.replace(/table_name/g, tableName).replace(/id_name/g, idName);
    return sql;
};

module.exports = pgTriggers;
