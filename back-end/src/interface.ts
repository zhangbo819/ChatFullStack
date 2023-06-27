export const local = 'local';
export const remote = 'remote';
export const root = 'zzb';
export const RootCode = _getRandomCode(); // TODO
console.log('RootCode', RootCode);

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

function _getRandomCode() {
  const res = [];
  let i = 4;
  while (i--) {
    res.push(Math.floor(Math.random() * 10));
  }
  return res.join('');
}
