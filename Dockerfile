# MiniASM (WDR+E) — the paper computer's IDE and VM, served as a static site.
#
# The repo root *is* the site: there is no bundler. The only build step is
# fetching Monaco, Blockly and dockview into vendor/, which the app loads
# relatively so it keeps working in a room with no internet.

FROM node:22-alpine AS build

# vendor.sh needs curl and tar; busybox provides tar, curl is not in the base.
RUN apk add --no-cache curl

WORKDIR /app
COPY . .

RUN sh scripts/vendor.sh

# Repo furniture the served page never loads. Mirrors STATIC_EXCLUDE in
# tools/build_runtime.sh, so the image and the platform dist hold the same files.
RUN rm -rf .git .github node_modules tests solutions other_implementations \
           scripts package.json package-lock.json README.md brainstorm.md \
           Dockerfile .dockerignore docker

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
