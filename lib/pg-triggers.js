/// <reference path="./pg-triggers.d.ts" />
"use strict";

var fs = require("fs/promises");

var pgTriggers = {}

function q(str) {
    return '"' + str.replace(/"/g, '""') + '"';
}

pgTriggers.dumpMaxIdTrigger = async function dumpMaxIdTrigger (tableName, idName, opts) {
    opts = opts || {};
    opts.firstId = opts.firstId || '1';
    opts.grouping = opts.grouping || [];
    var content = await fs.readFile(__dirname + "/table-max-id-trg.sql", "utf8");
    var sql = content
        .replace(/table_name/g, tableName.replace(/"/g, '""')) 
        .replace(/"id_name"/g, q(idName)) 
        .replace(/v_first_id/g, opts.firstId)
        .replace(/where true/g, opts.grouping.length ? `where ${
            opts.grouping.map(g => `x.${q(g)} = new.${q(g)}`).join(' and ')
        }` : '');
    return sql;
};

module.exports = pgTriggers;
