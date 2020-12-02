#!/bin/bash

rm -rf dist
mkdir dist
mkdir dist/api


# --- STATIC FILES --- #
cd app
yarn
yarn build
cd ..

cp -r static dist/static

# --- SERVER --- #
cp -r server dist/server


# --- API --- #
cd api
yarn
yarn build
yarn install --production --ignore-scripts --prefer-offline
cd ..

mv api/dist dist/api
cp api/Dockerfile dist/api/Dockerfile
cp api/package.json dist/api/package.json
cp api/yarn.lock dist/api/yarn.lock

# --- DOCKER --- #
cp .dockerignore dist/.dockerignore
cp docker-compose.yml dist/docker-compose.yml