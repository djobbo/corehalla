#!/usr/bin/env bash

set -a
source .env.dev

DOCKER_BUILDKIT=0

docker-compose -f reno/docker-compose.dev.yml -f supabase/docker/docker-compose.yml -f supabase/docker/dev/docker-compose.dev.yml build