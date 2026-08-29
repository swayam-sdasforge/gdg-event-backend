# ==========================================
# STAGE 1: Build the frontend (using Node)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build it 
COPY . .
RUN npm run build 

# ==========================================
# STAGE 2: Serve the frontend (using Nginx)
# ==========================================
FROM nginx:alpine

# Copy the built files from Stage 1 into the Nginx server
# Vite outputs to the 'dist' folder by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
