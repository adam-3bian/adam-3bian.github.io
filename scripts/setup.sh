#!/bin/sh
# User-local Debian 13 runtime; no root access and no package trust bypasses.
set -eu
cd "$(dirname "$0")/.."
TASK_TOOLS_ROOT=${CHERI_TOOLS_ROOT:-/workspace/cheri-tools}
python3 -m venv /workspace/cheri-migration-venv
/workspace/cheri-migration-venv/bin/pip install -r requirements-migration.txt
mkdir -p "$TASK_TOOLS_ROOT/apt/lists/partial" "$TASK_TOOLS_ROOT/apt/cache/archives/partial" "$TASK_TOOLS_ROOT/ruby"
cat > "$TASK_TOOLS_ROOT/apt/sources.list" <<'EOF'
deb [signed-by=/usr/share/keyrings/debian-archive-keyring.gpg] https://deb.debian.org/debian trixie main
EOF
/usr/bin/apt-get -o Dir::State::Lists="$TASK_TOOLS_ROOT/apt/lists" -o Dir::Cache="$TASK_TOOLS_ROOT/apt/cache" -o Dir::Etc::sourcelist="$TASK_TOOLS_ROOT/apt/sources.list" -o Dir::Etc::sourceparts=- update
/usr/bin/apt-get -o Dir::State::Lists="$TASK_TOOLS_ROOT/apt/lists" -o Dir::Cache="$TASK_TOOLS_ROOT/apt/cache" -o Dir::Etc::sourcelist="$TASK_TOOLS_ROOT/apt/sources.list" -o Dir::Etc::sourceparts=- -o Debug::NoLocking=1 --download-only -y install jekyll
for package in "$TASK_TOOLS_ROOT"/apt/cache/archives/*.deb; do dpkg-deb -x "$package" "$TASK_TOOLS_ROOT/ruby"; done
# Debian's SassC binding contains an absolute system library path. Relocate
# that path in this private extracted runtime; original .deb files are retained.
/workspace/cheri-migration-venv/bin/python - "$TASK_TOOLS_ROOT/ruby" <<'PY'
import sys
from pathlib import Path
root=Path(sys.argv[1])
for p in root.glob('usr/share/rubygems-integration/all/gems/sassc-*/lib/sassc/native.rb'):
 s=p.read_text()
 s=s.replace('ffi_lib "/usr/lib/#{RbConfig::CONFIG[\'arch\']}/libsass.#{dl_ext}"', 'ffi_lib "#{ENV.fetch(\'CHERI_RUBY_ROOT\', \'/workspace/cheri-tools/ruby\')}/usr/lib/#{RbConfig::CONFIG[\'arch\']}/libsass.#{dl_ext}"')
 p.write_text(s)
PY
export CHERI_RUBY_ROOT="$TASK_TOOLS_ROOT/ruby"
scripts/ruby.sh -e 'require "jekyll"; require "kramdown"; puts "Jekyll #{Jekyll::VERSION}, Kramdown #{Kramdown::VERSION}"'
