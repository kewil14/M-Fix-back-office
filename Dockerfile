FROM node:18.16.0 as build
WORKDIR /usr/local/app
COPY ./ /usr/local/app/
RUN npm cache clean --force
RUN npm install -g npm@9.5.1
RUN npm install -g @angular/cli@15.0.5
RUN ng version
RUN npm install @angular-devkit/build-angular --save-dev
RUN npm run build --force

FROM nginx:latest as prod
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY src/environments/environment.prod.ts /etc/nginx/conf.d/
COPY --from=build /usr/local/app/dist/skote /usr/share/nginx/html
EXPOSE 81
CMD ["nginx", "-g", "daemon off;"]
