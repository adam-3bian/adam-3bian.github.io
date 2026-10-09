#!/bin/sh
set -eu
TASK_RUBY_ROOT=${CHERI_RUBY_ROOT:-/workspace/cheri-tools/ruby}
export LD_LIBRARY_PATH="$TASK_RUBY_ROOT/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export RUBYLIB="$TASK_RUBY_ROOT/usr/lib/ruby/3.3.0:$TASK_RUBY_ROOT/usr/lib/x86_64-linux-gnu/ruby/3.3.0:$TASK_RUBY_ROOT/usr/lib/ruby/vendor_ruby:$TASK_RUBY_ROOT/usr/lib/x86_64-linux-gnu/ruby/vendor_ruby/3.3.0"
for path in "$TASK_RUBY_ROOT"/usr/lib/ruby/gems/3.3.0/gems/*/lib "$TASK_RUBY_ROOT"/usr/share/rubygems-integration/all/gems/*/lib "$TASK_RUBY_ROOT"/usr/lib/x86_64-linux-gnu/rubygems-integration/3.3.0/gems/*/lib; do
 export RUBYLIB="$RUBYLIB:$path"
done
export GEM_PATH="$TASK_RUBY_ROOT/usr/lib/ruby/gems/3.3.0:$TASK_RUBY_ROOT/usr/share/rubygems-integration/all:$TASK_RUBY_ROOT/usr/lib/x86_64-linux-gnu/rubygems-integration/3.3.0"
exec "$TASK_RUBY_ROOT/usr/bin/ruby3.3" "$@"
