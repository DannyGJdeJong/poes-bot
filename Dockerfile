FROM node:16

WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn

COPY . .
RUN yarn build

ENV NODE_ENV=production

CMD ["node", "build"]
