"use strict";

var bestGlobals = require("best-globals");
var changing = bestGlobals.changing;
var discrepances = require("discrepances");
var miniTools = require("mini-tools");
var pg = require("pg-promise-strict");
pg.easy = true;
pg.log = pg.logLastError;
pg.log.inFileName = 'last-pg-error-local.sql'

var pgTriggers = require("../lib/pg-triggers.js");

function isDate(x){ return x instanceof Date; }
function likeNow(str){
    var d=new Date(str);
    return Math.abs(new Date() - d)<10000;
}

describe("audit triggers", async ()=>{
    var db;
    var dbUser;
    before(async ()=>{
        var config = await miniTools.readConfig([
            "def-config",
            "local-config",
            {testing:true}
        ],{whenNotExist:'ignore'})
        try{
            dbUser = config.db.user;
            db = await pg.connect(config.db);
            await db.executeSqlScript("test/fixtures/common-schemas-fixture.sql");
            await db.executeSqlScript("lib/recreate-his.sql");
            await db.query(`set search_path = tri;`).execute();
            await db.executeSqlScript("lib/enance.sql");
            await db.executeSqlScript("lib/table-changes.sql");
            await db.executeSqlScript("lib/function-changes-trg.sql");
            await db.executeSqlScript("test/fixtures/common-tables-fixture.sql");
            await db.query(`select enance_table('people','name');`).execute();
            await db.executeSentences(
                (await pgTriggers.dumpMaxIdTrigger('animal', 'id')).split(/\r?\n\r?\n/)
            );
            await db.executeSentences(
                (await pgTriggers.dumpMaxIdTrigger('food', 'id', {grouping:['id_animal'], firstId: 2})).split(/\r?\n\r?\n/)
            );
        }catch(err){
            console.log(err);
            console.log(err.stack);
            throw err;
        }
    });
    after(async function(){
        if(db){
            await db.done();
            console.log('after:...done!');
        }
        await pg.shutdown();
        console.log('pg:...down!');
    });
    async function testQuery(sql, expectedValues, tableName, orderBy){
        await db.query(`DELETE FROM ${tableName ?? `his.changes`}`).execute();
        await db.query(sql).execute();
        var result = await  db.query(`SELECT * FROM ${tableName ?? `his.changes`} ORDER BY ${orderBy ?? `cha_schema, cha_table, cha_new_pk, cha_column, cha_new_value`}`).fetchAll();
        discrepances.showAndThrow(result.rows, expectedValues, {duckTyping:true});
    }
    var commonExpect={
        cha_schema:'tri',
        cha_old_pk:null,
        cha_old_value:null,
        cha_who:discrepances.test(function(who){ return who === dbUser; }),
        cha_when:discrepances.test(isDate),
        cha_context:null
    };
    describe("audit triggers", ()=>{
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
    describe("pk trigger", ()=>{
        it("auto pk", async ()=>{
            await testQuery(
                "INSERT INTO tri.animal(name) values ('Cat'),('Dog');",
                [{
                    id: 1,
                    name: 'Cat',
                }, {
                    id: 2,
                    name: 'Dog',
                }],
                'tri.animal',
                'id'
            );
        });
        it("auto pk (grouped)", async ()=>{
            await testQuery(
                "INSERT INTO tri.food(id_animal, food) values (1, 'tuna'),(1,'chicken'),(2,'beef');",
                [{
                    id_animal: 2,
                    id: 2,
                    food: 'beef',
                },{
                    id_animal: 1,
                    id: 3,
                    food: 'chicken',
                },{
                    id_animal: 1,
                    id: 2,
                    food: 'tuna',
                }],
                'tri.food',
                'food'
            );
        });
    })
});

describe("dumpMaxIdTrigger firstId", ()=>{
    var assert = require("assert"); // eslint-disable-line global-require
    it("uses a numeric firstId", async ()=>{
        var sql = await pgTriggers.dumpMaxIdTrigger('food', 'id', {firstId: 7});
        assert.ok(sql.includes('coalesce(v_curr_max + 1, 7)'));
    });
    it("uses a string firstId that is a number", async ()=>{
        var sql = await pgTriggers.dumpMaxIdTrigger('food', 'id', {firstId: '7'});
        assert.ok(sql.includes('coalesce(v_curr_max + 1, 7)'));
    });
    it("uses 1 when there is no firstId", async ()=>{
        var sql = await pgTriggers.dumpMaxIdTrigger('food', 'id');
        assert.ok(sql.includes('coalesce(v_curr_max + 1, 1)'));
    });
    it("rejects a firstId that is not a number", async ()=>{
        await assert.rejects(
            pgTriggers.dumpMaxIdTrigger('food', 'id', {firstId: '1); drop table food; --'}),
            /pg-triggers: firstId must be a number/
        );
    });
    it("keeps a $ of the names as is", async ()=>{
        var sql = await pgTriggers.dumpMaxIdTrigger('pre$&cios', 'id$`x', {grouping:["g$'1"]});
        assert.ok(sql.includes('from "pre$&cios" x'));
        assert.ok(sql.includes('select max("id$`x")'));
        assert.ok(sql.includes('where x."g$\'1" = new."g$\'1"'));
    });
});
