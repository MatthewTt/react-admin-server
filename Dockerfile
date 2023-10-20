FROM gplane/pnpm:latest as builder
WORKDIR /app

COPY pnpm-lock.yaml .
COPY package.json .

RUN pnpm install

COPY . .

RUN pnpm run build

# 使用pm2启动后段服务
FROM keymetrics/pm2:16-jessie

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
ENV TZ=Asia/Shanghai

RUN npm install -g pnpm
# 不需要安装dev依赖
RUN pnpm install --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/script ./script
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/tsconfig.json ./

EXPOSE 7001

CMD ["npm", "run", "start"]

