import { writeFile, readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { OnlineStatus, UserTable } from 'src/users/users.entity';
import { root as rootId } from '../interface';
// import { Identicon } from 'identicon.js';

// 封装 fs 对象
function _writeFileByPromise({ targetPath, data }) {
  return new Promise((resolve, reject) => {
    writeFile(targetPath, data, function (err) {
      if (err) {
        console.error(err);
        reject(err);
      }
      resolve(true);
    });
  });
}

// docker volumesPath 数据修改
const volumesPath = '/home/data/cache.json';
export function saveData(data) {
  _writeFileByPromise({
    targetPath: volumesPath,
    data,
  })
    .then((res) => {
      res && console.log(new Date().toLocaleDateString() + ' 数据保存成功');
    })
    .catch((err) => {
      console.log('saveData err', err);
    });
}
export function loadData(): Record<string, any> {
  const isExist = existsSync(volumesPath);
  if (!isExist) {
    console.log('目录 ' + volumesPath + ' 不存在');
    return {};
  }
  const data = readFileSync(volumesPath, { encoding: 'utf8' });
  let res: Record<string, any> = {};
  try {
    res = JSON.parse(data);
  } catch (err) {
    console.log('json 解析失败 ', err);
    res = {};
  }
  return res;
}

// 把两个 id 合并成一个 key
export function getChatKey(idA: string, idB: string, isGroup: '1' | '0') {
  if (isGroup === '1') return idA;
  let res;
  const split_char = '>';

  if (idA > idB) {
    res = idA + split_char + idB;
  } else {
    res = idB + split_char + idA;
  }

  return res;
}

// 根据名字生成 base64 图片
export function genBase64ImageByName(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Identicon = require('identicon.js');

  const hash = createHash('md5'); // 先转 md5
  hash.update(name);
  const imgData = new Identicon(hash.digest('hex')).toString();
  const imgUrl = 'data:image/png;base64,' + imgData;

  // console.log(imgUrl);

  return imgUrl;
}

// 增加 root 用户
// TODO migration 优化
export async function seedRootUser(dataSource: DataSource) {
  const repo = dataSource.getRepository(UserTable);

  const existing = await repo.findOne({
    where: { id: rootId },
  });

  if (!existing) {
    const root = repo.create({
      id: rootId,
      name: 'zzb',
      online: OnlineStatus.ONLINE,
      avatar: genBase64ImageByName('zzb'),
    });

    await repo.save(root);
    console.log('Root user created');
  }
}
