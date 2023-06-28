/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const uuid = require('uuid');
const historyData = require('./cache.json');

// console.log('historyData', historyData);
// console.log('uuid', uuid.v1());

// const map_chat = {
//   'id>id': [
//     {
//       time: 1687939161229,
//       form: 'zzb_id',
//       msg: '啦啦啦',
//     },
//   ],
// };

const { users, user_friends, data } = historyData;

function setTable_user() {
  const table_user = users.map((name) => {
    return {
      id: uuid.v4(name),
      name,
      friends: [],
      online: 1,
    };
  });

  table_user.forEach((item) => {
    if (item.friends.length !== user_friends[item.name].length) {
      item.friends = user_friends[item.name].map(
        (friend_name) => table_user.find((i) => i.name === friend_name)?.id,
      );
    }
  });
  return table_user;
}

// 用户列表
const table_user = setTable_user();

function setData() {
  const map_chat = {};
  //  用户名字对 id 的 hash
  const map_user_name_to_id = table_user.reduce((r, i) => {
    r[i.name] = i.id;
    return r;
  }, {});

  for (let nameA in data) {
    for (let nameB in data[nameA]) {
      const idA = map_user_name_to_id[nameA];
      const idB = map_user_name_to_id[nameB];
      const key = getChatKey(idA, idB);
      if (!map_chat[key]) {
        map_chat[key] = data[nameA][nameB].map((item) => {
          return {
            ...item,
            form: map_user_name_to_id[item.form],
          };
        });
      }
    }
  }

  return map_chat;
}

function getChatKey(idA, idB) {
  let res;
  const split_char = '>';

  if (idA > idB) {
    res = idA + split_char + idB;
  } else {
    res = idB + split_char + idA;
  }

  return res;
}

// 聊天记录
const map_chat = setData();

const res = {
  time: Date.now(),
  table_user,
  map_chat,
  // users,
  // user_friends
};
fs.writeFileSync('./cache.new.json', JSON.stringify(res, null, 4));
