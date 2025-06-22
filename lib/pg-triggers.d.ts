declare module "pg-triggers"{

function dumpMaxIdTrigger(tableName:string, idName:string, opts:{firstId:number, grouping:string[]}): Promise<string>;

}