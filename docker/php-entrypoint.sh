#!/bin/sh
set -eu

# Keep a readable copy for PHP workers in a private tmpfs, outside the web root.
umask 077
mkdir -p /run/small-heath /var/lib/small-heath/form-runtime
chown www-data:www-data /run/small-heath /var/lib/small-heath/form-runtime
chmod 700 /run/small-heath /var/lib/small-heath/form-runtime
if [ -f /etc/small-heath/.env ]; then
  cp /etc/small-heath/.env /run/small-heath/.env
  chown www-data:www-data /run/small-heath/.env
  chmod 600 /run/small-heath/.env
fi

exec "$@"
