# ---- build stage: compile the react app with vite ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- runtime stage: serve the static files with nginx ----
FROM nginx:1.27-alpine

# where nginx forwards /api requests; override at runtime, e.g. -e BACKEND_URL=http://my-backend:5001
ENV BACKEND_URL=http://backend:5001

# the nginx image runs envsubst on /etc/nginx/templates/*.template at startup
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
