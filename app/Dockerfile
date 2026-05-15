# app/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json terlebih dahulu (untuk cache layer)
COPY package*.json ./

# Install dependencies (production saja)
RUN npm install --production

# Copy seluruh source code
COPY . .

# Buat user non-root (best practice keamanan)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port app
EXPOSE 3000

# Jalankan server
CMD ["npm", "start"]
