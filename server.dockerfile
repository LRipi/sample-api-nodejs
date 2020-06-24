FROM node:latest

# Building API NodeJs
RUN mkdir /api
COPY ./ /api
WORKDIR /api
ADD ./package.json /api/package.json
RUN npm i

EXPOSE 3000

## THE LIFE SAVER
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

## Launch the wait tool and then your application
CMD /wait && npm start
