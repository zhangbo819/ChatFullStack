# TODO (ci) use git hooks
git pull --reb --no-edit
docker compose down
docker-compose build
docker-compose up -d
docker image prune -a -f
docker images
docker ps