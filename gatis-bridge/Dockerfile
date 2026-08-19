FROM node:20-alpine
WORKDIR /app
COPY gatis-bridge/package*.json ./
RUN npm install --omit=dev
COPY gatis-bridge/server.js ./server.js
ENV NODE_ENV=production
CMD ["node","server.js"]
