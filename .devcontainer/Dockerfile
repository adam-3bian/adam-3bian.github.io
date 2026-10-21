FROM ruby:3.3-alpine3.22

# Runtime tools and libraries; compilers are needed only while building gems.
RUN apk add --no-cache \
      bash ca-certificates git libcurl libffi libstdc++ nodejs openssh-client \
      openssl tzdata yaml \
    && addgroup -g 1000 vscode \
    && adduser -D -u 1000 -G vscode -s /bin/bash vscode

ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3

# Cache the pinned dependencies independently of site content. Both Intel and
# ARM Alpine/musl platforms are already present in the repository lockfile.
WORKDIR /opt/jekyll
COPY Gemfile Gemfile.lock ./
RUN apk add --no-cache --virtual .gem-build-deps \
      build-base linux-headers libffi-dev openssl-dev yaml-dev \
    && gem install bundler --version "$(sed -n '/BUNDLED WITH/{n;s/^[[:space:]]*//;p;}' Gemfile.lock)" --no-document \
    && BUNDLE_FROZEN=true bundle install \
    && bundle clean --force \
    && rm -rf /usr/local/bundle/cache \
    && apk del .gem-build-deps \
    && chown -R vscode:vscode /usr/local/bundle

WORKDIR /workspaces/cheri-alliance
USER vscode
EXPOSE 4000
CMD ["sleep", "infinity"]
