FROM node:14

WORKDIR /app

COPY . .

RUN npm install --only=prod

ENTRYPOINT [ "npm", "start" ]
