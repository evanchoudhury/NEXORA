
# ==============================================================================
# Multi-Stage Dockerfile for NEXORA E-Commerce Platform
# Stage 1: Build React Frontend
# Stage 2: Production Node.js + Express API & EJS Engine
# ==============================================================================

# STAGE 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# STAGE 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend into backend public static folder
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
