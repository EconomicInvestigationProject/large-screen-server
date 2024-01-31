FROM node:16.20.2

# 设置工作目录
# WORKDIR /usr/src/app

# 拷贝 package.json 和 package-lock.json
COPY package*.json ./

# 清理 npm 缓存
RUN npm cache clean --force

# 安装应用程序的依赖项
RUN npm install

# 复制应用程序的源代码到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "start"]
