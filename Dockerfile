FROM node:20.11.1

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
// COPY ./src ./src
EXPOSE 3500

CMD ["npm", "start"]