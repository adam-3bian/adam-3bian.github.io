#!/usr/bin/env python3
"""Serve the existing build; rebuild after editing Markdown or templates."""
import argparse
from http.server import ThreadingHTTPServer
from site_server import SiteHandler, metadata
parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4000)
args = parser.parse_args()
metadata()
server = ThreadingHTTPServer(('127.0.0.1', args.port), SiteHandler)
print('Serving the built CHERI Alliance site on port', args.port, flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
