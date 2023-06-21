export interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

export interface sendMessageParams {
  addData: DataType[];
}
