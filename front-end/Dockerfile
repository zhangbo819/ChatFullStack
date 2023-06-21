FROM nginx

WORKDIR /home/frontend

COPY dist .

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
