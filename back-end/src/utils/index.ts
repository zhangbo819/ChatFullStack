import { writeFile, readFileSync, existsSync } from 'fs';

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

const volumesPath = '/home/data/cache.json';
export function saveData(data) {
  _writeFileByPromise({
    targetPath: volumesPath,
    data,
  })
    .then((res) => {
      console.log('saveData res', res);
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
