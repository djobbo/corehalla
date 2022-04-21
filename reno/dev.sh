#!/usr/bin/env bash

set -a
source .env.dev

cd reno

docker-compose -f docker-compose.dev.yml up -d

DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/postgres

cd ../corehalla/packages/db

yarn db:migrate