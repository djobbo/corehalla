#!/usr/bin/env bash

RENO_VERSION="0.0.1"

# this file path
SCRIPT_PATH=$(readlink -f "$0")
# .reno path
export RENO_PATH=$(dirname "$SCRIPT_PATH")
# corehalla path
export COREHALLA_PATH=$(dirname "$RENO_PATH")

cd $RENO_PATH || exit 1

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
        docker compose -f docker-compose.dev.yml build --no-cache && \
            echo "RENO: Build complete." || \
            echo "RENO: Build failed."
        ;;
    "up")
        echo "RENO: Starting..."
        docker compose -f docker-compose.dev.yml up -d && \
        DATABASE_URL=postgres://postgres:$RENO_POSTGRES_PASSWORD@localhost:$RENO_POSTGRES_PORT/postgres && \
        cd $COREHALLA_PATH/packages/db && \
        for i in {1..5};
        do
            echo "RENO: Waiting for database to start..."
            pnpm db:migrate && break || sleep 15;
        done && \
            echo "RENO: Started." || \
            echo "RENO: Failed to start."
        ;;
    "stop")
        echo "RENO: Stopping..."
        docker compose -f docker-compose.dev.yml stop && \
            echo "RENO: Stopped." || \
            echo "RENO: Failed to stop."
        ;;
    "logs")
        echo "RENO: Logs..."
        docker logs corehalla-app
        ;;
    "logs_f")
        echo "RENO: Logs..."
        docker logs corehalla-app -f --tail 200
        ;;
    "pnpm")
        echo "RENO: Running pnpm..."
        docker exec -it corehalla-app pnpm $@
        ;;
    "exec")
        echo "RENO: Running command..."
        docker exec -it corehalla-app $@
        ;;
    "bash")
        echo "RENO: Running bash..."
        docker exec -it corehalla-app /bin/bash
        ;;
    "restart")
        echo "RENO: Restarting..."
        docker compose -f docker-compose.dev.yml restart
        ;;
    "rm")
        $RENO_PATH/reno.sh stop && \
        echo "RENO: Removing..." && \
        docker compose -f docker-compose.dev.yml rm -f && \
            echo "RENO: Removed all containers" || \
            echo "RENO: Failed to remove containers."
        ;;
    "prune")
        $RENO_PATH/reno.sh rm && \
        echo "RENO: Pruning..." && \
        docker system prune -af && \
            echo "RENO: Pruned." || \
            echo "RENO: Failed to prune."
        ;;
    *)
        echo "RENO: Unknown command: $1"
        ;;
    esac