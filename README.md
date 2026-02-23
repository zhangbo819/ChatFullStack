# ChatFullStack

全栈项目, 聊天软件

- 前端: Vue3
- 后端: Nest
- Docker 封装, Docker compose 启动两个容器

## TODOS

### 项目构建

- [x] 前后端项目初始化，并用 docker 打包部署，外部能够访问
- [x] Docker compose 整合，服务器拉取代码后一键更新(完成) (可优化 CI/CD)
- [x] 数据持久化 (临时方案实现)
- [x] Postgresql 保存总体数据
- [ ] AWS EC2 部署，第一年免费，之后大概一个月1500日元
- [ ] Redis 缓存层
- [ ] 前端改为 Next
- [ ] CI CD，自动构建

### 新功能

- [x] 添加好友功能
- [x] 群聊功能
- [x] 通讯录 好友列表
- [ ] 发送语音消息 (需要 https、oss)

### 后端优化

- [x] 消息列表机制
- [x] JWT 重构登录
- [ ] 优化含 base 64 接口速度 (统一一个接口获取) -> 直接增加一个用户详情表，方便未来扩展 -> 暂时没必要做
- [ ] 消息加密

### 前端优化

- [x] 分包
- [x] gzip

## 云服务器初始化过程

1. 云服务器管理页面
   > 远程连接 -> 秘钥管理 -> 把自己电脑的 ssh 公钥放进去 就可以通过本地命令行登录了
2. 安装 git
   > `yum install git`
3. 通过 git 拉取项目 （用 http 的方式即可）
4. 安装 Node、pnpm (注意要下大于 16 版本的 Node)
   > [Linux 安装 node，npm （详细图解）](https://cloud.tencent.com/developer/article/1772306)
   > 注意要将软链地址改成真实下载地址，再放到 /usr/local/bin/node 下

```sh
ln -s /root/node-v21.5.0-linux-x64/bin/node /usr/local/bin/node
ln -s /root/node-v21.5.0-linux-x64/bin/npm /usr/local/bin/npm
ln -s /root/node-v21.5.0-linux-x64/bin/pnpm /usr/local/bin/pnpm
```

5. `npm install -g pnpm`
6. `pnpm i `
7. 安装 docker、docker-compose
   > [Ubuntu 安装 docker](https://juejin.cn/post/7122708049122459662)
   > [使用Docker-compose打包整个网站项目一键部署](https://juejin.cn/post/6981207521994211359)
   > [阿里云安装 docker docker-compose](https://help.aliyun.com/zh/ecs/use-cases/deploy-and-use-docker-on-alibaba-cloud-linux-2-instances)
8. `sh serverUpdate.sh` 启动项目
9. 记得把 front-end 下的 nginx 代理换成新服务器域名
10. 最后要在云服务器的防火墙里将后端端口 9000 暴露出来才能访问
