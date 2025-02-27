# discord

FROM node:22.14-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev && npm cache clean --force

ENTRYPOINT ["./entrypoint.sh"]