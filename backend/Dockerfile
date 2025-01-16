FROM node:20

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3500

CMD ["npm", "start"]
