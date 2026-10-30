"""Exercise the real PHP/ALTCHA/SMTP handler against an isolated local mail sink.

Run after composer install and backend/build-schema.rb. No external mail is sent.
PHP_COMMAND may select a local PHP executable (default: php).
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import shlex
import shutil
import socket
import socketserver
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]

class MailSink(socketserver.StreamRequestHandler):
    def handle(self):
        def reply(line):
            self.wfile.write((line + '\r\n').encode())
            self.wfile.flush()
        reply('220 localhost SMTP test sink')
        while line := self.rfile.readline():
            command = line.decode(errors='replace').strip().upper()
            if command.startswith(('EHLO', 'HELO')): reply('250 localhost')
            elif command == 'DATA':
                if self.server.reject:
                    reply('451 Temporary test failure')
                    continue
                reply('354 End with a dot')
                message = []
                while (part := self.rfile.readline()) != b'.\r\n':
                    if not part: return
                    message.append(part)
                self.server.messages.append(b''.join(message).decode())
                reply('250 Message accepted')
            elif command == 'QUIT':
                reply('221 Bye')
                return
            else: reply('250 OK')

class FormService:
    def __init__(self, port=0, origin='http://127.0.0.1:4201', cost=5, counter=10):
        self.temp = tempfile.TemporaryDirectory(prefix='small-heath-test-')
        self.root = Path(self.temp.name)
        for folder in ['private', 'public']:
            shutil.copytree(ROOT / 'backend' / folder, self.root / folder, ignore=shutil.ignore_patterns('runtime'))
        (self.root / 'vendor').symlink_to(ROOT / 'backend/vendor', target_is_directory=True)
        self.smtp = socketserver.ThreadingTCPServer(('127.0.0.1', 0), MailSink)
        self.smtp.daemon_threads = True
        self.smtp.messages = []
        self.smtp.reject = False
        threading.Thread(target=self.smtp.serve_forever, daemon=True).start()
        self.origin = origin
        self.env = {
            'FORM_ENABLED': 'true', 'FORM_ALLOWED_ORIGINS': origin,
            'FORM_CONTACT_RECIPIENT': 'contact@example.invalid',
            'FORM_APPLICATION_RECIPIENT': 'applications@example.invalid',
            'SMTP_HOST': '127.0.0.1', 'SMTP_PORT': str(self.smtp.server_address[1]),
            'SMTP_ENCRYPTION': 'none', 'SMTP_USERNAME': '', 'SMTP_PASSWORD': '',
            'SMTP_FROM_ADDRESS': 'forms@example.invalid', 'ALTCHA_SECRET': 'a' * 64,
            'FORM_RATE_LIMIT': '1000', 'FORM_CHALLENGE_LIMIT': '1000',
            'ALTCHA_COST': str(cost), 'ALTCHA_MAX_COUNTER': str(counter), 'ALTCHA_EXPIRES': '600',
        }
        self.write_env()
        if not port:
            with socket.socket() as probe:
                probe.bind(('127.0.0.1', 0))
                port = probe.getsockname()[1]
        self.url = f'http://127.0.0.1:{port}/index.php'
        self.log = (self.root / 'php.log').open('w+')
        self.process = subprocess.Popen(shlex.split(os.environ.get('PHP_COMMAND', 'php')) + ['-S', f'127.0.0.1:{port}', '-t', str(self.root / 'public')], stdout=self.log, stderr=self.log)
        for attempt in range(100):
            try:
                if self.request('GET', form='unknown')[0] == 404: break
            except OSError: time.sleep(.05)
        else: raise RuntimeError('PHP test server failed to start')

    def write_env(self):
        (self.root / '.env').write_text('\n'.join(f'{key}="{value}"' for key, value in self.env.items()) + '\n')

    def request(self, method, data=None, form='contact', origin=None, challenge=False, content_type='application/x-www-form-urlencoded'):
        query = urllib.parse.urlencode({'form': form, **({'challenge': '1'} if challenge else {})})
        body = urllib.parse.urlencode(data, doseq=True).encode() if data is not None else None
        request = urllib.request.Request(self.url + '?' + query, data=body, method=method, headers={'Origin': origin or self.origin, 'Accept': 'application/json', 'Content-Type': content_type})
        try: response = urllib.request.urlopen(request)
        except urllib.error.HTTPError as error: response = error
        payload = response.read()
        return response.status, json.loads(payload) if payload else {}, dict(response.headers)

    def solution(self, form='contact'):
        code, challenge, _ = self.request('GET', form=form, challenge=True)
        assert code == 200, (code, challenge)
        params = challenge['parameters']
        for counter in range(int(self.env['ALTCHA_MAX_COUNTER']) + 1):
            password = bytes.fromhex(params['nonce']) + counter.to_bytes(4, 'big')
            key = hashlib.pbkdf2_hmac('sha256', password, bytes.fromhex(params['salt']), params['cost'], params['keyLength'])
            if key.hex().startswith(params['keyPrefix']):
                payload = {'challenge': challenge, 'solution': {'counter': counter, 'derivedKey': key.hex(), 'time': .01}}
                return base64.b64encode(json.dumps(payload).encode()).decode()
        raise AssertionError('No ALTCHA solution')

    def close(self):
        self.process.terminate()
        self.process.wait(timeout=5)
        self.smtp.shutdown()
        self.smtp.server_close()
        self.log.close()
        self.temp.cleanup()


def run():
    service = FormService()
    passed = []
    def expect(name, code, result):
        assert result[0] == code, (name, result)
        passed.append(name)
    message = {'name': 'Example Resident', 'email': 'resident@example.invalid', 'subject': 'General enquiry', 'message': 'A fictional message for the local mail sink.', 'privacy': 'yes', '_complete': 'yes'}
    try:
        expect('preflight', 204, service.request('OPTIONS'))
        expect('unknown form', 404, service.request('GET', form='other'))
        expect('origin denied', 403, service.request('GET', origin='https://not-allowed.invalid', challenge=True))
        expect('unsupported method', 405, service.request('PUT'))
        expect('missing CAPTCHA', 422, service.request('POST', message))
        expect('malformed CAPTCHA', 422, service.request('POST', {**message, 'altcha': 'not-base64'}))
        solution = service.solution()
        tampered = json.loads(base64.b64decode(solution))
        tampered['challenge']['parameters']['expiresAt'] += 100
        expect('signed expiry tampering', 422, service.request('POST', {**message, 'altcha': base64.b64encode(json.dumps(tampered).encode()).decode()}))
        expect('cross-form CAPTCHA', 422, service.request('POST', {**message, 'altcha': solution}, form='application'))
        result = service.request('POST', {**message, 'name': '', 'altcha': solution})
        expect('server required-field validation', 422, result)
        assert 'name' in result[1]['errors']
        expect('honeypot', 422, service.request('POST', {**message, 'website': 'spam', 'altcha': solution}))
        expect('header injection', 422, service.request('POST', {**message, 'email': 'x@example.invalid\r\nBcc: injected@example.invalid', 'altcha': solution}))
        result = service.request('POST', {**message, 'altcha': solution})
        expect('SMTP acceptance', 200, result)
        assert len(service.smtp.messages) == 1
        assert 'To: contact@example.invalid' in service.smtp.messages[0]
        assert 'Reply-To: resident@example.invalid' in service.smtp.messages[0]
        reference = result[1]['reference']
        expect('CAPTCHA replay denied', 409, service.request('POST', {**message, 'altcha': solution}))
        result = service.request('POST', {**message, 'altcha': service.solution()})
        expect('duplicate receipt', 200, result)
        assert result[1]['reference'] == reference and len(service.smtp.messages) == 1
        service.smtp.reject = True
        expect('SMTP failure', 503, service.request('POST', {**message, 'message': 'A different message to test delivery failure.', 'altcha': service.solution()}))
        service.smtp.reject = False
        expect('SMTP retry', 200, service.request('POST', {**message, 'message': 'A different message to test delivery failure.', 'altcha': service.solution()}))
        schema = json.loads((service.root / 'private/form-schema.json').read_text())['application']
        application = {'_complete': 'yes', 'altcha': service.solution('application'), 'joint_application': 'No'}
        for section in schema['sections']:
            for field in section['fields']:
                if not field.get('required') or field['name'] in application: continue
                if field['type'] in ['select', 'radio']:
                    option = 'No' if 'No' in field['options'] else field['options'][0]
                    value = option.get('value') if isinstance(option, dict) else option
                elif field['type'] == 'date': value = '2000-01-01'
                elif field['type'] == 'checkbox': value = field.get('value', 'yes')
                elif field['type'] == 'number': value = str(field.get('min', 0))
                else: value = 'Fictional test answer'
                application[field['name']] = value
        application.update({'moving_people[0][surname]': 'Example', 'moving_people[0][first_names]': 'Person', 'skills[]': ['Gardening', 'Other']})
        # Use only choices present in the supplied schema.
        skills = next(field for section in schema['sections'] for field in section['fields'] if field['name'] == 'skills')
        application['skills[]'] = skills['options'][:2]
        expect('housing application and repeat rows', 200, service.request('POST', application, form='application'))
        assert 'To: applications@example.invalid' in service.smtp.messages[-1]
        joint = {**application, 'joint_application': 'Yes', 'altcha': service.solution('application')}
        result = service.request('POST', joint, form='application')
        expect('conditional joint fields', 422, result)
        assert 'joint_surname' in result[1]['errors'] and 'joint_declaration' in result[1]['errors']
        expect('body size limit', 413, service.request('POST', {**message, 'message': 'a' * 140000}))
        expect('wrong content type', 415, service.request('POST', message, content_type='application/json'))
        for record in (service.root / 'private/runtime').glob('*.json'):
            text = record.read_text()
            assert 'Example Resident' not in text and 'resident@example.invalid' not in text
        service.env['FORM_RATE_LIMIT'] = '1'
        service.write_env()
        expect('rate limit', 429, service.request('POST', message))
        service.env['FORM_ENABLED'] = 'false'
        service.write_env()
        expect('disabled service', 503, service.request('GET', challenge=True))
        print(f'PASS: {len(passed)} backend checks; real ALTCHA verification and SMTP, no external email.')
    finally:
        service.close()

if __name__ == '__main__': run()
