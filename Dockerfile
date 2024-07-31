FROM node:18-alpine as base

WORKDIR /opt/build

COPY package.json yarn.lock tsconfig.json ./

RUN yarn run ci

COPY lambda/ lambda/

RUN yarn run bundle

##################################################################

FROM public.ecr.aws/lambda/nodejs:18-x86_64 as runner

WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=base \
  /opt/build/package.json \
  /opt/build/yarn.lock \
  /opt/build/tsconfig.json \
  ./

COPY --from=base \
  /opt/build/dist \
  ./

RUN npm install --global yarn

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_SKIP_DOWNLOAD=true

RUN yarn run ci

EXPOSE 3000

CMD [ "index.handler" ]
