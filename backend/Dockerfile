# 1. Use slim for production (lighter and more secure)
FROM node:18-slim

# 2. Metadata
LABEL description="NodeJS application with Mysql client installed"
LABEL version="1.0.0"
LABEL maintainer="VENKATESAN SM"

# 3. Setup workspace with correct permissions in one go
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# 4. Copy package files using the --chown flag
# This is a 'Pro' move: it sets permissions DURING the copy, saving a layer
COPY --chown=node:node ./backend/package.json ./

# 5. Switch to non-root user BEFORE installing dependencies
USER node

# 6. Install dependencies (Cached unless package.json changes)
RUN npm install --production

# 7. Copy the rest of the application code
# Again, using --chown to avoid the extra RUN command at the end
COPY --chown=node:node ./backend ./

EXPOSE 3000

# 8. Entry point
CMD ["node", "index.js"]
