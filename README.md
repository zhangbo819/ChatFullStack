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
- [ ] 改为 WebSocket 通信
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

## 未来规划

🌱 第 1 阶段：系统像“服务”（Day 1–3）

目标：
👉 让项目从 Demo → 服务

✅ Day 1：统一日志系统

做 3 件事即可：

Nest middleware 生成 requestId

全局异常过滤器记录错误

所有接口打印结构化日志

完成后你就能写：

实现统一请求追踪与错误日志系统


✅ Day 2：API 响应结构统一

所有接口返回：

{
success: boolean,
data: any,
error?: string,
requestId: string
}

这是典型企业级接口规范。

简历可写：

设计统一 API 响应规范，提高系统可维护性

✅ Day 3：权限守卫（最简单 RBAC）

只做：

admin / user 两种角色

Guard 控制某些接口

够了。

简历可写：

实现基于角色的接口权限控制

🌿 第 2 阶段：体现架构思维（Day 4–7）

目标：
👉 让面试官觉得你会设计系统

✅ Day 4：消息结构升级

给 message 表增加：

type 字段（text/image/system）

JSONB meta 字段

不用改逻辑，只是未来扩展能力。

简历可写：

设计可扩展消息模型，支持多类型内容

✅ Day 5：Redis 缓存（只缓存 1 件事）

缓存：

👉 最近会话列表

实现：

查询前先查 Redis

更新时同步 Redis

就这一点就够。

简历可写：

通过 Redis 缓存热点会话数据，降低数据库访问压力

✅ Day 6–7：画系统架构图（超重要）

画一个图包含：

前端

API

PostgreSQL

Redis

WebSocket

这一步会让项目价值翻倍。

🌼 第 3 阶段：AI 接入（Day 8–11）

目标：
👉 让项目拥有“未来感”

但必须简单。

✅ Day 8：AI 接口封装

写一个 service：

aiService.ask(prompt)

内部调用 OpenAI / Claude / 任意模型。

简历可写：

封装 AI 服务接口，支持系统级调用

✅ Day 9–10：聊天总结功能

只做：

取最近 N 条聊天

拼 prompt

调 AI

返回总结

不用向量库都行。

简历可写：

实现 AI 驱动的聊天内容自动总结功能

这在日本非常加分。

✅ Day 11：新增 /summary API

用户点击按钮 → 返回总结。

这就是完整 AI 功能闭环。

🌞 第 4 阶段：面试杀手锏（Day 12–14）

目标：
👉 让项目“看起来像产品”

这一步决定就职成功率。

✅ Day 12：写 README（最重要）

必须包含：

1️⃣ 系统架构图
2️⃣ 技术选型理由
3️⃣ 性能优化点
4️⃣ AI 功能说明

README > 代码重要度 ×3

✅ Day 13：部署上线

随便选：

Fly.io

Render

AWS

只要能访问。

简历可写：

完成系统部署与线上运行

✅ Day 14：准备“项目说明模板”

你要能用 1 分钟讲清：

这个系统解决什么问题

架构如何设计

AI 在哪里

未来如何扩展

这一步比写代码更重要。
