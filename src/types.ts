export type DataSource<Row> = Array<Row>;

export type Fields = string[];

export type AggFC<Row> = (subset: DataSource<Row>, measures: Fields) => Row;

export interface CubeProps<Row> {
  aggFunc?: AggFC<Row>;
  factTable?: DataSource<Row>;
  dimensions?: Fields;
  measures?: Fields;
  [key: string]: any;
}

export type JsonRecord = { [key: string]: any };
