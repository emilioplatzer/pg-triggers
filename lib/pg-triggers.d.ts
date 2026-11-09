declare module "pg-triggers"{

/** The paths of the scripts that create the history of changes, in the order they run. */
const historyScripts: string[];

function dumpMaxIdTrigger(tableName:string, idName:string, opts:{firstId:number, grouping:string[]}): Promise<string>;

}
