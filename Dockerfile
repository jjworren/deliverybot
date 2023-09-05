FROM node:18.17.1-alpine as builder
COPY . /app
WORKDIR /app
RUN yarn policies set-version
RUN yarn
RUN yarn build

FROM node:18.17.1-alpine
ENV NODE_ENV="production"
COPY --from=builder /app /app
WORKDIR /app
RUN yarn install --prod
EXPOSE 3000
CMD ["yarn", "server"]
