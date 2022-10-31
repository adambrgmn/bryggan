FROM node:18.12.0-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

WORKDIR /usr/src/app

COPY --chown=node:node ./package.json ./
COPY --chown=node:node ./package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY --chown=node:node ./ .

ENV NODE_ENV=production
RUN npm run build

USER node
CMD ["dumb-init", "./node_modules/.bin/remix-serve", "build"]
