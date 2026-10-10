"""Serve a built project site locally using its actual deployment base path."""
import json, os, threading
from pathlib import Path
from urllib.parse import urlsplit
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from contextlib import contextmanager
ROOT = Path(__file__).resolve().parents[1]
SITE = Path(os.environ.get('CHERI_SITE_DESTINATION', ROOT / '_site'))

def metadata():
    return json.loads((SITE / 'site-build.json').read_text())

class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)
    def log_message(self, *args):
        pass
    def deployment_path_allowed(self):
        prefix = metadata()['baseurl'].rstrip('/')
        path = urlsplit(self.path).path
        if prefix and path == '/':
            self.send_response(302); self.send_header('Location', prefix + '/'); self.end_headers(); return False
        if prefix and path != prefix and not path.startswith(prefix + '/'):
            self.send_error(404); return False
        return True
    def do_GET(self):
        if not self.deployment_path_allowed():return
        super().do_GET()
    def do_HEAD(self):
        if not self.deployment_path_allowed():return
        super().do_HEAD()
    def translate_path(self, path):
        path = urlsplit(path).path
        prefix = metadata()['baseurl'].rstrip('/')
        if prefix and (path == prefix or path.startswith(prefix + '/')):
            path = path[len(prefix):] or '/'
        return super().translate_path(path)
    def send_error(self, code, message=None, explain=None):
        if code == 404 and (SITE / '404.html').is_file():
            body = (SITE / '404.html').read_bytes()
            self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(body))); self.end_headers()
            if self.command != 'HEAD':self.wfile.write(body)
        else:
            super().send_error(code, message, explain)

@contextmanager
def serving():
    server = ThreadingHTTPServer(('127.0.0.1', 0), SiteHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    try:
        yield server, f'http://127.0.0.1:{server.server_port}' + metadata()['baseurl'].rstrip('/')
    finally:
        server.shutdown(); server.server_close(); thread.join()
