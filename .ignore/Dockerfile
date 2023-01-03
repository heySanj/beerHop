# This tells Docker to get the latest version of the node Docker image running on Alpine Linux and name this image base.
FROM node:alpine as base

# This tells Docker to switch to and run the app in the /app directory.
WORKDIR /app

# This tells Docker to copy the package.json and yarn.lock files to the root of the container's working directory.
COPY package.json yarn.lock ./

# This will ensure that the installations of your dependencies are up-to-date.
RUN rm -rf node_modules && yarn install --frozen-lockfile && yarn cache clean

# This tells Docker to copy everything in the root directory of the project to the /app directory of the container.
COPY . .

# This tells Docker to run the app.js file in the /app directory, essentially running the Express app.
CMD ["node", "./app.js"]