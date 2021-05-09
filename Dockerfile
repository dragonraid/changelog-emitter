FROM node:14

COPY . .

RUN npm install --only=prod

ENTRYPOINT [ "npm", "start" ]
