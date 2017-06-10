FROM node:latest

LABEL name="linden-honey-bot" \
      maintainer="aliaksandr.babai@gmail.com"

ARG ROOT_DIR=/usr/workspace
ARG WORK_DIR=$ROOT_DIR/linden-honey-bot
ENV PORT=8080

RUN mkdir -p $WORK_DIR
COPY . $WORK_DIR
WORKDIR $WORK_DIR

RUN npm install

EXPOSE $PORT
CMD [ "npm", "run", "start" ]
