FROM registry.cn-hangzhou.aliyuncs.com/aliyun-node/alinode:4.7.2-jessie
WORKDIR /app
COPY . /app
EXPOSE 4000
ENV BACKEND_URL=http://localhost:8080
ENTRYPOINT ["node","serve.js"]