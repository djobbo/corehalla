FROM node:latest

WORKDIR /usr/src/api

COPY ./api/package.json .
COPY ./api/yarn.lock .

RUN yarn

COPY ./@types ..
COPY ./api .

CMD ["yarn", "run", "serve"]