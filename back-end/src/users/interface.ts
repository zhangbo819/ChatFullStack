export interface User {
  id: string;
  name: string;
  avatar: string;
  friends: string[];
  online: 1 | 0;
}

// TODO
// export interface UserInfo extends User {
//   avatar: string;
//   // createAt: 1687939161229;
//   // updateAt: 1687939161229;
//   // password: string;
// }

export interface Group {
  id: string;
  name: string;
  owner: string;
  avatar: string;
  member: string[];
  //  createAt: 1687939161229,
  //  updateAt: 1687939161229,
}
