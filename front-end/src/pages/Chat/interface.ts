export interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

export interface sendMessageParams {
  form: string;
  to: string;
  addData: DataType[];
}

export interface getChatListParams {
  form: string;
  to: string;
  // time: number;
}
