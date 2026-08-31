# 构建阶段安装完整依赖并生成前端静态文件。
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段只保留服务端所需的生产依赖和文件。
FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared

# 容器内监听所有接口，宿主机负责限制来源网段。
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787
EXPOSE 8787

# 应用不需要 root 权限。
USER node
CMD ["node", "server/index.mjs"]
