# syntax=docker/dockerfile:1

FROM php:8.2-fpm-alpine AS php-runtime

# proxy_ca is optional and is needed only by environments with a custom proxy CA.
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then \
      cat /etc/ssl/cert.pem /run/secrets/proxy_ca > /tmp/build-ca.pem; \
      export SSL_CERT_FILE=/tmp/build-ca.pem; \
    fi; \
    apk add --no-cache --virtual .form-build-deps $PHPIZE_DEPS oniguruma-dev \
    && docker-php-ext-install -j2 mbstring \
    && apk add --no-cache oniguruma \
    && apk del .form-build-deps \
    && mkdir -p /var/lib/small-heath/form-runtime \
    && chown www-data:www-data /var/lib/small-heath/form-runtime \
    && rm -f /tmp/build-ca.pem

COPY docker/php-entrypoint.sh /usr/local/bin/form-entrypoint
ENTRYPOINT ["sh", "/usr/local/bin/form-entrypoint"]
CMD ["php-fpm"]

FROM php-runtime AS php-dependencies
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /build/forms
COPY forms/composer.json forms/composer.lock ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then \
      cat /etc/ssl/cert.pem /run/secrets/proxy_ca > /tmp/build-ca.pem; \
      export SSL_CERT_FILE=/tmp/build-ca.pem CURL_CA_BUNDLE=/tmp/build-ca.pem; \
    fi; \
    apk add --no-cache unzip \
    && composer install --no-dev --prefer-dist --no-interaction --no-plugins --no-scripts --optimize-autoloader \
    && rm -f /tmp/build-ca.pem

FROM ruby:3.3-alpine AS site-builder
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then \
      cat /etc/ssl/cert.pem /run/secrets/proxy_ca > /tmp/build-ca.pem; \
      export SSL_CERT_FILE=/tmp/build-ca.pem; \
    fi; \
    apk add --no-cache build-base linux-headers \
    && rm -f /tmp/build-ca.pem

WORKDIR /src
COPY Gemfile Gemfile.lock ./
RUN --mount=type=secret,id=proxy_ca \
    if [ -s /run/secrets/proxy_ca ]; then \
      cat /etc/ssl/cert.pem /run/secrets/proxy_ca > /tmp/build-ca.pem; \
      export SSL_CERT_FILE=/tmp/build-ca.pem; \
    fi; \
    gem install bundler -v 2.6.7 --no-document \
    && bundle _2.6.7_ install \
    && rm -f /tmp/build-ca.pem

COPY . ./
COPY --from=php-dependencies /build/forms/vendor ./forms/vendor
CMD ["sh", "docker/build-site.sh"]
