export type JsonRecord = { [key: string]: any };

export type DataSource = Array<JsonRecord>;

export type Fields = string[];

export type AggFC = (subset: DataSource, measures: Fields) => JsonRecord;

export interface CubeProps {
  aggFunc?: AggFC;
  factTable?: DataSource;
  dimensions?: Fields;
  measures?: Fields;
  [key: string]: any;
}
