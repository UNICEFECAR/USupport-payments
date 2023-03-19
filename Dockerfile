FROM node:16.5.0-alpine3.13

WORKDIR /home/node/app
COPY ./service/ .

RUN npm ci

EXPOSE 3004

CMD [ "npm", "run", "prod" ]