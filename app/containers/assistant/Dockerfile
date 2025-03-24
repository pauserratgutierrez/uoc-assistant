# assistant

FROM node:22.14-alpine
WORKDIR /app

# If package.json doesn't change, Docker won't rerun the npm install step
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]