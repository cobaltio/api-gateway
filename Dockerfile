FROM node:14-alpine
ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY --chown=node:node package*.json .

RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]