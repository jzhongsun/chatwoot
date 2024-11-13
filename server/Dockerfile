FROM node:lts-slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 4000
ENV BACKEND_URL=http://localhost:8080
ENTRYPOINT ["node","serve.js"]