# FROM keymetrics/pm2
FROM node:18

RUN mkdir -p /home/backend

WORKDIR /home/backend

COPY ./ /home/backend

RUN npm install -g pnpm

RUN pnpm install

RUN pnpm run build

ENV NPM_CONFIG_LOGLEVEL warn

EXPOSE 9000

# CMD ["pm2-runtime", "start", "pm2.config.js", "--env", "production"]
# CMD ["pnpm", "run", "pm2:prod"]
CMD ["pnpm", "run", "start:prod"]

