<?php
declare(strict_types=1);

use AltchaOrg\Altcha\Altcha;
use AltchaOrg\Altcha\CreateChallengeOptions;
use AltchaOrg\Altcha\VerifySolutionOptions;
use AltchaOrg\Altcha\Algorithm\Pbkdf2;
use PHPMailer\PHPMailer\PHPMailer;

function respond(int $code, array $data): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function matchesCondition(array $condition, array $input): bool {
    $value = $input[$condition['name']] ?? null;
    return is_array($value) ? in_array($condition['value'], $value, true) : $value === $condition['value'];
}
function charLength(string $v): int {
    return preg_match_all('/./us', $v, $unused) ?: 0;
}
function checkField(array $field, mixed $raw, bool $required, string $key, array &$errors): string|array {
    $label = $field['label'];
    $type = $field['type'] ?? 'text';
    $options = array_map(fn($v) => is_array($v) ? (string)$v['value'] : (string)$v, $field['options'] ?? []);
    if ($type === 'checkboxes') {
        if ($raw === null) $raw = [];
        if (!is_array($raw) || count($raw) > count($options) || array_filter($raw, fn($v) => !is_string($v) || !in_array($v, $options, true))) {
            $errors[$key] = $label.': select only the listed choices.'; return [];
        }
        return array_values(array_unique($raw));
    }
    if ($raw !== null && !is_string($raw)) {
        $errors[$key] = $label.': enter a single value.'; return '';
    }
    $value = trim(str_replace(["\r\n", "\r"], "\n", $raw ?? ''));
    if ($value === '') {
        if ($required) $errors[$key] = $label.': this answer is required.';
        return '';
    }
    if (!preg_match('//u', $value) || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        $errors[$key] = $label.': contains unsupported characters.'; return '';
    }
    if ($type !== 'textarea' && str_contains($value, "\n")) $errors[$key] = $label.': enter a single line.';
    if (charLength($value) > ($field['maxlength'] ?? 500)) $errors[$key] = $label.': the answer is too long.';
    if (isset($field['minlength']) && charLength($value) < $field['minlength']) $errors[$key] = $label.': please provide more detail.';
    if (in_array($type, ['select','radio'], true) && !in_array($value, $options, true)) $errors[$key] = $label.': select a listed choice.';
    if ($type === 'checkbox' && $value !== ($field['value'] ?? 'yes')) $errors[$key] = $label.': please confirm the statement.';
    if ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) $errors[$key] = $label.': enter a valid email address.';
    if ($type === 'date') {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value, new DateTimeZone('Europe/London'));
        if (!$date || $date->format('Y-m-d') !== $value) $errors[$key] = $label.': enter a valid date.';
        elseif (!empty($field['date_past']) && $date > new DateTimeImmutable('today', new DateTimeZone('Europe/London'))) $errors[$key] = $label.': the date cannot be in the future.';
    }
    if ($type === 'number') {
        $step = (string)($field['step'] ?? '1');
        $pattern = $step === '0.01' ? '/^\d+(?:\.\d{1,2})?$/' : '/^\d+$/';
        if (!preg_match($pattern, $value) || (isset($field['min']) && (float)$value < $field['min']) || (isset($field['max']) && (float)$value > $field['max'])) $errors[$key] = $label.': enter a valid number in the allowed range.';
    }
    return $value;
}
function validateAnswers(array $schema, array $input): array {
    $errors = []; $answers = [];
    foreach ($schema['sections'] as $section) {
        foreach ($section['fields'] as $field) {
            $name = $field['name'];
            if (isset($field['when']) && !matchesCondition($field['when'], $input)) continue;
            if ($field['type'] === 'repeat') {
                $rows = $input[$name] ?? [];
                if (!is_array($rows) || count($rows) > $field['max_rows']) { $errors[$name] = $field['label'].': too many or invalid entries.'; continue; }
                $clean = [];
                foreach ($rows as $index => $row) {
                    if (!preg_match('/^\d+$/D', (string)$index) || (int)$index > 10000 || !is_array($row)) { $errors[$name] = $field['label'].': invalid entry.'; continue; }
                    $populated = count(array_filter($row, fn($value) => !is_string($value) || trim($value) !== '')) > 0;
                    if (!$populated) continue;
                    $item = [];
                    foreach ($field['fields'] as $child) {
                        $key = $name.'['.$index.']['.$child['name'].']';
                        $item[$child['name']] = checkField($child, $row[$child['name']] ?? null, !empty($child['row_required']), $key, $errors);
                    }
                    $clean[] = $item;
                }
                $answers[$name] = $clean;
            } else {
                $required = !empty($field['required']) || (isset($field['required_when']) && matchesCondition($field['required_when'], $input));
                $answers[$name] = checkField($field, $input[$name] ?? null, $required, $name, $errors);
            }
        }
    }
    return [$answers, $errors];
}
function messageBody(array $schema, array $answers, string $reference): string {
    $body = "Small Heath Park Housing Co-operative\n".$schema['subject']."\nReference: ".$reference."\nReceived (UTC): ".gmdate('Y-m-d H:i:s')."\n";
    foreach ($schema['sections'] as $section) {
        $body .= "\n=== ".$section['title']." ===\n";
        if ($section['id'] === 'declaration') $body .= ($section['description'] ?? '')."\n\n";
        foreach ($section['fields'] as $field) {
            $value = $answers[$field['name']] ?? '';
            if ($value === '' || $value === []) continue;
            $body .= "\n".$field['label'].":\n";
            if ($field['type'] === 'repeat') {
                foreach ($value as $index => $row) {
                    $body .= $field['item_label'].' '.($index+1)."\n";
                    foreach ($field['fields'] as $child) $body .= '  '.$child['label'].': '.($row[$child['name']] ?? '')."\n";
                }
            } else $body .= (is_array($value) ? implode(', ', $value) : $value)."\n";
        }
    }
    return $body;
}
function requestOrigin(): string {
    if (isset($_SERVER['HTTP_ORIGIN'])) return $_SERVER['HTTP_ORIGIN'];
    $parts = parse_url($_SERVER['HTTP_REFERER'] ?? '');
    if (!$parts || !isset($parts['scheme'], $parts['host'])) return '';
    return $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
}

function lockState(string $path) {
    $handle = fopen($path, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) throw new RuntimeException('State unavailable');
    chmod($path, 0600);
    return $handle;
}

function writeState($handle, array $value): void {
    rewind($handle);
    ftruncate($handle, 0);
    $data = json_encode($value, JSON_THROW_ON_ERROR);
    if (fwrite($handle, $data) !== strlen($data) || !fflush($handle)) {
        throw new RuntimeException('State write failed');
    }
}

function rateLimit(array $config, string $identity, string $kind, int $limit): bool {
    $path = $config['runtime_dir'] . '/rate-' . $kind . '-' . hash_hmac('sha256', $identity, $config['secret']) . '.json';
    $handle = lockState($path);
    try {
        $events = json_decode(stream_get_contents($handle), true) ?: [];
        $events = array_values(array_filter($events, fn($time) => is_int($time) && $time > time() - 3600));
        if (count($events) >= $limit) return false;
        $events[] = time();
        writeState($handle, $events);
        return true;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function sendEmail(array $config, array $schema, array $answers, string $reference): void {
    $smtp = $config['smtp'];
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $smtp['host'];
    $mail->Port = (int)$smtp['port'];
    $mail->SMTPAuth = $smtp['username'] !== '';
    $mail->Username = $smtp['username'];
    $mail->Password = $smtp['password'];
    $mail->SMTPSecure = $smtp['encryption'];
    // Unencrypted SMTP is allowed only for a local development mail sink.
    if ($smtp['encryption'] === 'none' && in_array($smtp['host'], ['localhost', '127.0.0.1', '::1'], true)) {
        $mail->SMTPSecure = '';
        $mail->SMTPAutoTLS = false;
    } elseif (!in_array($smtp['encryption'], ['tls', 'ssl'], true)) {
        throw new RuntimeException('SMTP encryption must be tls or ssl');
    }
    $mail->Timeout = 15;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($smtp['from_address'], $smtp['from_name']);
    $mail->addAddress($config['recipients'][$schema['id']]);
    $replyTo = $answers[$schema['id'] === 'contact' ? 'email' : 'applicant_email'] ?? '';
    if ($replyTo !== '') $mail->addReplyTo($replyTo);
    $mail->Subject = $schema['subject'] . ' [' . $reference . ']';
    $mail->Body = messageBody($schema, $answers, $reference);
    $mail->send();
}

function handleForm(): never {
    try {
        handleRequest();
    } catch (Throwable $error) {
        // Never log request bodies, personal answers, credentials or SMTP transcripts.
        error_log('Small Heath form service failed: ' . get_class($error));
        respond(503, ['ok' => false, 'message' => 'Online sending is temporarily unavailable. Your form has not been confirmed as sent. Your answers have been kept. Please try again or telephone the office.']);
    }
}

function handleRequest(): never {
    header('Vary: Origin');
    $id = $_GET['form'] ?? '';
    if (!is_string($id) || !in_array($id, ['contact', 'application'], true)) {
        respond(404, ['ok' => false, 'message' => 'Unknown form.']);
    }
    if (!is_file(__DIR__ . '/config.php')) {
        respond(503, ['ok' => false, 'message' => 'Online sending has not yet been enabled. Please telephone the office.']);
    }
    $config = require __DIR__ . '/config.php';
    $origin = requestOrigin();
    if (!in_array($origin, $config['allowed_origins'] ?? [], true)) {
        respond(403, ['ok' => false, 'message' => 'This website is not authorised to submit this form.']);
    }
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST, OPTIONS');
        respond(405, ['ok' => false, 'message' => 'Use the form to send this request.']);
    }
    if (empty($config['enabled']) || strlen($config['secret'] ?? '') < 32) {
        respond(503, ['ok' => false, 'message' => 'Online sending has not yet been enabled. Please telephone the office.']);
    }
    foreach ([$config['smtp']['from_address'] ?? '', $config['recipients'][$id] ?? ''] as $mailbox) {
        if (!filter_var($mailbox, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $mailbox)) {
            throw new RuntimeException('Mailbox configuration invalid');
        }
    }
    require_once dirname(__DIR__) . '/vendor/autoload.php';
    $runtime = $config['runtime_dir'];
    if (!is_dir($runtime) && !mkdir($runtime, 0700, true)) throw new RuntimeException('Runtime unavailable');
    $documentRoot = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($documentRoot && str_starts_with(realpath($runtime) . '/', rtrim($documentRoot, '/') . '/')) {
        throw new RuntimeException('Runtime must be outside the public directory');
    }
    // Never trust client-supplied forwarded-IP headers.
    $identity = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $binding = $identity . '|' . $origin . '|' . $id;
    $altcha = new Altcha(
        hmacSignatureSecret: hash_hmac('sha256', 'challenge|' . $binding, $config['secret']),
        hmacKeySignatureSecret: hash_hmac('sha256', 'solution|' . $binding, $config['secret']),
    );
    if ($method === 'GET') {
        if (($_GET['challenge'] ?? '') !== '1') {
            respond(405, ['ok' => false, 'message' => 'Open the website to complete a form.']);
        }
        if (!rateLimit($config, $identity, 'challenge', (int)$config['challenge_limit'])) {
            header('Retry-After: 3600');
            respond(429, ['ok' => false, 'message' => 'Too many verification requests. Please try again later.']);
        }
        $challenge = $altcha->createChallenge(new CreateChallengeOptions(
            algorithm: new Pbkdf2(),
            cost: (int)$config['captcha']['cost'],
            counter: random_int(1, (int)$config['captcha']['max_counter']),
            expiresAt: time() + (int)$config['captcha']['expires'],
        ));
        respond(200, $challenge->toArray());
    }
    if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/x-www-form-urlencoded')) {
        respond(415, ['ok' => false, 'message' => 'Unsupported form format.']);
    }
    $rawBody = file_get_contents('php://input', false, null, 0, (int)$config['max_body_bytes'] + 1);
    if (strlen($rawBody) > (int)$config['max_body_bytes'] || (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > (int)$config['max_body_bytes']) {
        respond(413, ['ok' => false, 'message' => 'The application is too long. Please shorten very long answers or telephone the office.']);
    }
    if (!rateLimit($config, $identity, 'submit', (int)$config['rate_limit'])) {
        header('Retry-After: 3600');
        respond(429, ['ok' => false, 'message' => 'Too many submission attempts. Please try again in an hour or telephone the office.']);
    }
    if (($_POST['_complete'] ?? null) !== 'yes' || ($_POST['website'] ?? '') !== '') {
        respond(422, ['ok' => false, 'message' => 'The form could not be accepted. Please telephone the office if this continues.']);
    }
    $encoded = $_POST['altcha'] ?? '';
    $verified = false;
    if (is_string($encoded) && strlen($encoded) <= 8192 && $encoded !== '') {
        try {
            $verification = new VerifySolutionOptions(payload: $encoded, algorithm: new Pbkdf2());
            $verified = $altcha->verifySolution($verification)->verified;
        } catch (InvalidArgumentException | TypeError | ValueError $error) {
            $verified = false;
        }
    }
    if (!$verified) {
        respond(422, ['ok' => false, 'message' => 'Please complete a new spam-protection check. Your answers have been kept.']);
    }
    $schemas = json_decode(file_get_contents(__DIR__ . '/form-schema.json'), true, flags: JSON_THROW_ON_ERROR);
    $schema = $schemas[$id];
    [$answers, $errors] = validateAnswers($schema, $_POST);
    if ($errors) respond(422, ['ok' => false, 'message' => 'Please correct the marked answers.', 'errors' => $errors]);

    // Consume each signed challenge once. The lock also prevents concurrent replay.
    $nonce = $verification->payload->challenge->parameters->nonce;
    $challengePath = $runtime . '/challenge-' . hash('sha256', $nonce) . '.json';
    $challengeHandle = lockState($challengePath);
    try {
        if (stream_get_contents($challengeHandle) !== '') {
            respond(409, ['ok' => false, 'message' => 'That spam-protection check has already been used. Please complete a new check. Your answers have been kept.']);
        }
        writeState($challengeHandle, ['time' => time()]);
    } finally {
        flock($challengeHandle, LOCK_UN);
        fclose($challengeHandle);
    }

    // Store only a keyed fingerprint and reference, never the submitted answers.
    $fingerprint = hash_hmac('sha256', $id . '|' . json_encode($answers, JSON_THROW_ON_ERROR), $config['secret']);
    $receipt = lockState($runtime . '/receipt-' . $fingerprint . '.json');
    try {
        $previous = json_decode(stream_get_contents($receipt), true) ?: [];
        if (($previous['status'] ?? '') === 'sent' && ($previous['time'] ?? 0) > time() - 86400) {
            $reference = $previous['reference'];
        } else {
            $reference = 'SHP-' . strtoupper(bin2hex(random_bytes(5)));
            sendEmail($config, $schema, $answers, $reference);
            writeState($receipt, ['status' => 'sent', 'reference' => $reference, 'time' => time()]);
        }
    } finally {
        flock($receipt, LOCK_UN);
        fclose($receipt);
    }
    $message = 'Your ' . ($id === 'application' ? 'application' : 'message') . ' has been accepted by the mail server for delivery.';
    if ($id === 'application') $message .= ' This is not an offer of housing.';
    respond(200, ['ok' => true, 'reference' => $reference, 'message' => $message]);
}
