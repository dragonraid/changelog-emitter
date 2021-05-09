FROM node:14

WORKDIR /app

COPY . .

# TODO: separate build and run container
RUN npm install \
    /app/node_modules/.bin/tsc

ENTRYPOINT [ "node", "/app/dist/index.js" ]
