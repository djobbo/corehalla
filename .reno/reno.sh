#!/usr/bin/env bash
RENO_VERSION="0.0.1"

# Get the path to the script
SCRIPT_PATH=$(readlink -f "$0")
RENO_PATH=$(dirname "$SCRIPT")

echo $SCRIPT_PATH

cd $RENO_PATH

set -a
source .env.dev

case $1 in
    "")
        echo "RENO: Usage: reno [cmd] [...args]"
        ;;
    "version")
        echo "RENO: Reno version: v$RENO_VERSION"
        ;;
    "build")
        echo "RENO: Building..."
        docker-compose -f docker-compose.dev.yml build --no-cache \
            && echo "RENO: Build complete." \
            || echo "RENO: Build failed."
        ;;
    "start")
        echo "RENO: Starting..."
        docker-compose -f docker-compose.dev.yml up -d && \
        DATABASE_URL=postgres://postgres:$RENO_POSTGRES_PASSWORD@localhost:$RENO_POSTGRES_PORT/postgres && \
        cd ../corehalla/packages/db && \
        for i in {1..5}; do command "yarn db:migrate" break || sleep 15; done \
            && echo "RENO: Started." \
            || echo "RENO: Failed to start."
        ;;
    "logs")
        echo "RENO: Logs..."
        docker logs corehalla-app
        ;;
    "logs_f")
        echo "RENO: Logs..."
        docker logs corehalla-app -f --tail 200
        ;;
    "yarn")
        echo "RENO: Yarn..."
        docker exec -it corehalla-app yarn
        ;;
    "restart")
        echo "RENO: Restarting..."
        docker-compose -f docker-compose.dev.yml restart
        ;;
    *)
        echo "RENO: Unknown command: $1"
        ;;
    esac