# 先打包
FROM node:18-alpine

RUN mkdir -p /home/build

WORKDIR /home/build

COPY ./ /home/build

# RUN npm install -g pnpm

# RUN pnpm install

RUN npm install

RUN npm run build


# 配置 nginx
FROM nginx:1.19.6-alpine

WORKDIR /home/frontend

COPY --from=0 /home/build/dist .

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
