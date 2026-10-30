#!/bin/sh
set -eu

ruby -rjson -e 'puts JSON.generate({url: ENV.fetch("SITE_URL", "http://localhost:8080")})' > /tmp/docker-site.yml
configs=_config.yml,_config-php.yml,/tmp/docker-site.yml
# Until the private settings enable forms, show the existing unavailable notice.
if [ ! -f /etc/small-heath/.env ] || ! grep -Eiq "^[[:space:]]*FORM_ENABLED[[:space:]]*=[[:space:]]*['\"]?(true|yes|on|1)['\"]?([[:space:]]*($|#))" /etc/small-heath/.env; then
  printf 'forms:\n  endpoint: ""\n' > /tmp/forms-disabled.yml
  configs="$configs,/tmp/forms-disabled.yml"
fi

bundle exec jekyll build --safe --strict_front_matter \
  --config "$configs" --destination /tmp/site
chmod -R a+rX /tmp/site
mkdir -p /www/html
cp -a /tmp/site/. /www/html/
