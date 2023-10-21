FROM node:18

RUN apt-get update
RUN apt-get install -y \
    curl \
    zsh

RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

RUN npm install -g pnpm

ENV NODE_ENV development

RUN git config --global --add safe.directory /workspace
