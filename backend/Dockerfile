FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# install only production deps first so this layer is cached between code changes
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

# run as the unprivileged user that ships with the node image
USER node

EXPOSE 5001

CMD ["node", "src/server.js"]
