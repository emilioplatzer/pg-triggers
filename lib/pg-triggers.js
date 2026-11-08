/// <reference path="./pg-triggers.d.ts" />
"use strict";

var fs = require("fs/promises");
var Path = require("path");

var pgTriggers = {}

function q(str) {
    return '"' + str.replaceAll('"', '""') + '"';
}

function isNumber(value) {
    return typeof value === 'number' ? Number.isFinite(value) : typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value);
}

pgTriggers.dumpMaxIdTrigger = async function dumpMaxIdTrigger (tableName, idName, opts) {
    opts = opts || {};
    opts.firstId = opts.firstId || '1';
    if (!isNumber(opts.firstId)) {
        throw new Error('pg-triggers: firstId must be a number');
    }
    opts.grouping = opts.grouping || [];
    var content = await fs.readFile(Path.join(__dirname, "table-max-id-trg.sql"), "utf8");
    var sql = content
        // the replacements are functions: a replacement string would interpret $&, $` and $' (the names could contain them)
        .replaceAll('table_name', () => tableName.replace(/"/g, '""')) 
        .replaceAll('"id_name"', () => q(idName)) 
        .replaceAll('v_first_id', () => String(opts.firstId))
        .replaceAll('where true', () => opts.grouping.length ? `where ${
            opts.grouping.map(g => `x.${q(g)} = new.${q(g)}`).join(' and ')
        }` : '');
    return sql;
};

module.exports = pgTriggers;
