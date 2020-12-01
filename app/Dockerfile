FROM node:latest

WORKDIR /usr/src/app

COPY ./app/package.json .
COPY ./app/yarn.lock .

RUN yarn

COPY ./@types ..
COPY ./app .

CMD ["yarn", "run", "build"]