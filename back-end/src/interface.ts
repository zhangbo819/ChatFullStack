// export const root = 'zzb';
export const root = '3295d1ab-bc27-416b-9c16-112a0a634eca';
export const RootCode = _getRandomCode(); // TODO 其他方式优化下
console.log('RootCode', RootCode);

// export interface table_user_item {
//   id: string;
//   name: string;
//   friends: string[];
//   online: 1 | 0;
//   //  createAt: 1687939161229,
//   //  updateAt: 1687939161229,
// }

export type map_chat_Type = Record<string, API_CHAT.DataType[]>;

export type map_message_Type = Record<
  string,
  Record<string, API_CHAT.message_item>
>;

function _getRandomCode() {
  const res = [];
  let i = 4;
  while (i--) {
    res.push(Math.floor(Math.random() * 10));
  }
  return res.join('');
}
