#!/usr/bin/env bash

set -a
source .env.dev

cd corehalla/packages/db && yarn db:migrate