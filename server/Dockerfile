FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16
RUN npm config set registry https://registry.npmmirror.com
EXPOSE 4000
ENV BACKEND_URL=http://localhost:8080
WORKDIR /app
COPY . /app
RUN npm install
ENTRYPOINT ["node","serve.js"]