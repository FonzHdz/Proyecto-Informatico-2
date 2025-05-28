FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install --production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]