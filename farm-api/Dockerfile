FROM node:22-alpine
WORKDIR /app
COPY farm-api/package.json ./package.json
RUN npm install --omit=dev
COPY farm-api/server.js ./server.js
CMD ["npm", "start"]
