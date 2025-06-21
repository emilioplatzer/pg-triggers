declare module "pg-triggers"{

function table_name_max_id_trg(tableName:string, idName:string): Promise<string>;

}