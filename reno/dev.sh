#!/usr/bin/env bash

set -a
source .env.dev

cd reno

docker-compose -f docker-compose.dev.yml up --build -d

cd ../corehalla/packages/db

yarn db:migrate