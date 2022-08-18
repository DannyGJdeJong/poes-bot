FROM node:18.4.0-alpine3.15

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn

COPY nodemon.json tsconfig.json ./
COPY src ./src/
ENV NODE_ENV=production
CMD ["npm", "run", "app"]
