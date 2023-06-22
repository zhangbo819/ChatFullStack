export const local = 'local';
export const remote = 'remote';
export const root = 'zzb';


export interface DataType {
  time: string | number;
  msg: string;
  form: string;
}

export interface sendMessageParams {
  addData: DataType[];
}
