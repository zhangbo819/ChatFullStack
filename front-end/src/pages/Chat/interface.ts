export interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

export interface ShowDataType extends DataType {
  avatar: string;
}
