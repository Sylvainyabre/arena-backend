# syntax=docker/dockerfile:1
FROM node:18.12.1
ENV NODE_ENV=production

WORKDIR /arena-backend

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]