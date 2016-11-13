"use strict";

var util = require("util");
var bestGlobals = require("best-globals");
var changing = bestGlobals.changing;
var discrepances = require("discrepances");
var miniTools = require("mini-tools");
var pg = require("pg-promise-strict");
pg.easy = true;

function autoprops(object, names){
    var nameList=typeof names === "string" ? names.split(/,\s*/) : names;
    nameList.forEach(function(name){
        object[name] = {get: function(value){
            object[name] = value;
        }};
    });
}

function Locals(names){
    autoprops(this, names);
};

describe("triggers", function(){
    var local = new Locals('config,db');
    before(function(){
        return miniTools.readConfig([
            "def-config",
            "local-config",
        ]).then(local.config.get).then(function(){
            return pg.connect(local.config.db);
        }).then(local.db.get).then(function(){
            return local.db.executeSqlScript("test/fixtures/common-schemas-fixture.sql");
        }).then(function(){
            return local.db.executeSqlScript("lib/table-changes.sql");
        }).then(function(){
            return local.db.executeSqlScript("lib/function-changes-trg.sql");
        }).then(function(){
            return local.db.executeSqlScript("test/fixtures/common-tables-fixture.sql");
        }).catch(function(err){
            console.log(err);
            console.log(err.stack);
            throw err;
        });
    });
    function testQuery(sql, expectedValues){
        return local.db.query(sql).execute().then(function(){
            return local.db.query("SELECT * FROM his.changes ORDER BY cha_when, cha_schema, cha_table, cha_column").fetchAll();
        }).then(function(result){
            var diffs = discrepances(result.rows, expectedValues, {duckTyping:true});
            if(diffs){
                console.log('DISCREPANCES');
                /*
                console.dir(result.rows, {depth:4});
                console.dir(expectedValues, {depth:4});
                */
                console.dir(diffs, {depth:6});
                throw new Error("discrepances");
            }
        });
    };
    var commonExpect={
        cha_schema:'tri',
        cha_old_pk:null,
        cha_old_value:null,
        cha_who:'codenautas_user',
        cha_when:discrepances.test(function isDate(x){ return x instanceof Date; }),
        cha_context:null
    };
    it("insert peope 1 row 1 field text", function(){
        return testQuery(
            "INSERT INTO tri.people(name) values ('Bob');",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'age',
                cha_op:'INSERT',
                cha_new_value:null,
            }),changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'name',
                cha_op:'INSERT',
                cha_new_value:'Bob',
            })]
        );
    });
});