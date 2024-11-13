FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 4000
ENV BACKEND_URL=http://localhost:8080
ENTRYPOINT ["node","serve.js"]