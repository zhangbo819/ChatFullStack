# 先打包
FROM node:18-alpine

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build


# 配置 nginx
FROM nginx:1.19.6-alpine

WORKDIR /home/frontend

COPY dist .

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
