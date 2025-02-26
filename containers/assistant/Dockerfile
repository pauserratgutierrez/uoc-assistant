# uoc_assistant

FROM node:22.14-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev && npm cache clean --force
RUN mkdir -p /dataset

ENTRYPOINT ["./entrypoint.sh"]