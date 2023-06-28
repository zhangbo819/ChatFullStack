// export const local = 'local';
// export const remote = 'remote';
// export const root = 'zzb';
export const root = 'f11f2f04-d7e2-41a8-893c-9eb8e2d7b9a4';
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

export interface table_user_item {
  id: string;
  name: string;
  friends: string[];
  online: 1 | 0;
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}

export type map_chat_Type = Record<string, DataType[]>;

function _getRandomCode() {
  const res = [];
  let i = 4;
  while (i--) {
    res.push(Math.floor(Math.random() * 10));
  }
  return res.join('');
}
