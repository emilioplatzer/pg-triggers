"use strict";

var bestGlobals = require("best-globals");
var changing = bestGlobals.changing;
var discrepances = require("discrepances");
var miniTools = require("mini-tools");
var pg = require("pg-promise-strict");
pg.easy = true;
pg.log = pg.logLastError;
pg.log.inFileName = 'last-pg-error-local.sql'

function isDate(x){ return x instanceof Date; }
function likeNow(str){ 
    var d=new Date(str);
    return Math.abs(new Date() - d)<10000;
}

describe("triggers", async ()=>{
    var db;
    before(async ()=>{
        var config = await miniTools.readConfig([
            "def-config",
            "local-config",
            {testing:true}
        ],{whenNotExist:'ignore'})
        try{
            db = await pg.connect(config.db);
            await db.executeSqlScript("test/fixtures/common-schemas-fixture.sql");
            await db.executeSqlScript("lib/recreate-his.sql");
            await db.executeSqlScript("lib/table-changes.sql");
            await db.executeSqlScript("lib/function-changes-trg.sql");
            await db.executeSqlScript("test/fixtures/common-tables-fixture.sql");
        }catch(err){
            console.log(err);
            console.log(err.stack);
            throw err;
        }
    });
    after(function(){
        if(db){
            db.done();
            console.log('after:...done!');
        }
    });
    async function testQuery(sql, expectedValues){
        await db.query("DELETE FROM his.changes").execute();
        await db.query(sql).execute();
        var result = await  db.query("SELECT * FROM his.changes ORDER BY cha_schema, cha_table, cha_new_pk, cha_column, cha_new_value").fetchAll();
        discrepances.showAndThrow(result.rows, expectedValues, {duckTyping:true});
    };
    var commonExpect={
        cha_schema:'tri',
        cha_old_pk:null,
        cha_old_value:null,
        cha_who:'codenautas_user',
        cha_when:discrepances.test(isDate),
        cha_context:null
    };
    it("insert peope 1 row 1 field text", async ()=>{
        await testQuery(
            "INSERT INTO tri.people(name) values ('Bob');",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'active',
                cha_op:'INSERT',
                cha_new_value:true,
            }), changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Bob"},
                cha_column:'name',
                cha_op:'INSERT',
                cha_new_value:'Bob',
            })]
        );
    });
    it("update 1 field from null", async ()=>{
        await testQuery(
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
    it("update 1 field of pk", async ()=>{
        await testQuery(
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
    it("set context", async ()=>{
        await db.query("SET application_name = 'this testing'").execute()
        await testQuery(
            "UPDATE tri.people SET active=false, quit=current_timestamp;",
            [changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Mary"},
                cha_old_pk:{"name": "Mary"},
                cha_column:'active',
                cha_op:'UPDATE',
                cha_new_value:false,
                cha_old_value:true,
                cha_context:'this testing'
            }), changing(commonExpect,{
                cha_table:'people',
                cha_new_pk:{"name": "Mary"},
                cha_old_pk:{"name": "Mary"},
                cha_column:'quit',
                cha_op:'UPDATE',
                cha_new_value:discrepances.test(likeNow),
                cha_context:'this testing'
            })]
        );
    });
    it("delete record", async ()=>{
        await db.query("SET application_name = 'this testing'").execute();
        await testQuery(
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