# Universal image — runs on Railway, Render, Fly.io, or any container host.
FROM node:20-alpine

WORKDIR /app

# Install prod deps first so this layer is cached when only app code changes.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Hosts inject $PORT; server.js reads it (Number(process.env.PORT) || 5000).
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]
