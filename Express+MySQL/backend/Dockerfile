FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose app port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
