# 打包
# FROM keymetrics/pm2
FROM node:18-alpine

RUN mkdir -p /home/build

WORKDIR /home/build

COPY ./ /home/build

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build

# ENV NPM_CONFIG_LOGLEVEL warn


# 运行
FROM node:18-alpine

WORKDIR /home/backend

COPY --from=0 /home/build/dist ./dist
COPY --from=0 /home/build/node_modules ./node_modules 
# TODO node_modules 打包后为什么需要

# CMD ["pm2-runtime", "start", "pm2.config.js", "--env", "production"]
# CMD ["pnpm", "run", "pm2:prod"]
CMD ["node", "./dist/main"]

EXPOSE 9000
