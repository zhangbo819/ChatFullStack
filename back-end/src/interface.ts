export const local = 'local';
export const remote = 'remote';
export const root = 'zzb';
export const RootCode = 4396; // TODO

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
  time: number;
}
