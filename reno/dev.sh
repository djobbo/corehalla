#!/usr/bin/env bash

set -a
source .env.dev

docker-compose -f supabase/docker/docker-compose.yml -f supabase/docker/dev/docker-compose.dev.yml -f reno/docker-compose.dev.yml up --build -d

./reno/migrate.sh