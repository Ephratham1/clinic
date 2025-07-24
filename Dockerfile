# Stage 1: Build the backend application
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY server/ .

# Stage 2: Run the backend application
FROM node:18-alpine AS backend-runner

WORKDIR /app

# Create a non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chown appuser:appgroup /app/logs

# Copy production dependencies and built application from builder stage
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/ .

# Set the user to run the application
USER appuser

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "app.js"]
