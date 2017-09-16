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

function isDate(x){ return x instanceof Date; }
function likeNow(str){ 
    var d=new Date(str);
    return Math.abs(new Date() - d)<10000;
}

describe("triggers", function(){
    var local = new Locals('config,db');
    before(function(){
        return miniTools.readConfig([
            "def-config",
            "local-config",
        ],{readConfig:{whenNotExist:'ignore'}, testing:true}).then(local.config.get).then(function(){
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
        return local.db.query("DELETE FROM his.changes").execute().then(function(){
            return local.db.query(sql).execute();
        }).then(function(){
            return local.db.query("SELECT * FROM his.changes ORDER BY cha_when, cha_schema, cha_table, cha_column").fetchAll();
        }).then(function(result){
            discrepances.showAndThrow(result.rows, expectedValues, {duckTyping:true});
        });
    };
    var commonExpect={
        cha_schema:'tri',
        cha_old_pk:null,
        cha_old_value:null,
        cha_who:'codenautas_user',
        cha_when:discrepances.test(isDate),
        cha_context:null
    };
    it("insert peope 1 row 1 field text", function(){
        return testQuery(
            "INSERT INTO tri.people(name) values ('Bob');",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'name',
                cha_op:'INSERT',
                cha_new_value:'Bob',
            }),changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'active',
                cha_op:'INSERT',
                cha_new_value:true,
            })]
        );
    });
    it("update 1 field from null", function(){
        return testQuery(
            "UPDATE tri.people SET age=21;",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_old_pk:{"name": "Bob"},
                cha_column:'age',
                cha_op:'UPDATE',
                cha_new_value:21,
            })]
        );
    });
    it("update 1 field of pk", function(){
        return testQuery(
            "UPDATE tri.people SET name='Mary';",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Mary"},
                cha_old_pk:{"name": "Bob"},
                cha_column:'name',
                cha_op:'UPDATE',
                cha_new_value:'Mary',
                cha_old_value:'Bob',
            })]
        );
    });
    it("set context", function(){
        return local.db.query("SET application_name = 'this testing'").execute().then(function(){
            return testQuery(
                "UPDATE tri.people SET active=false, quit=current_timestamp;",
                [changing(commonExpect,{
                    cha_table:'people',
                    cha_new_pk:{"name": "Mary"},
                    cha_old_pk:{"name": "Mary"},
                    cha_column:'quit',
                    cha_op:'UPDATE',
                    cha_new_value:discrepances.test(likeNow),
                    cha_context:'this testing'
                }),changing(commonExpect,{
                    cha_table:'people',
                    cha_new_pk:{"name": "Mary"},
                    cha_old_pk:{"name": "Mary"},
                    cha_column:'active',
                    cha_op:'UPDATE',
                    cha_new_value:false,
                    cha_old_value:true,
                    cha_context:'this testing'
                })]
            );
        });
    });
    it("delete record", function(){
        return local.db.query("SET application_name = 'this testing'").execute().then(function(){
            return testQuery(
                "DELETE FROM tri.people WHERE name='Mary'",
                [changing(commonExpect,{
                    cha_table:'people',
                    cha_new_pk:null,
                    cha_old_pk:{"name": "Mary"},
                    cha_column:null,
                    cha_op:'DELETE',
                    cha_new_value:null,
                    cha_old_value:{name:'Mary', age:21, active:false, quit:discrepances.test(likeNow)},
                    cha_context:'this testing'
                })]
            );
        });
    });
});