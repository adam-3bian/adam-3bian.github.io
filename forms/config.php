<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

// With _site/ as the web root, .env and runtime files live beside it.
// FORM_ENV_FILE can select a different private location on the PHP host.
$siteRoot = dirname(__DIR__);
$envFile = ($_SERVER['FORM_ENV_FILE'] ?? getenv('FORM_ENV_FILE')) ?: dirname($siteRoot) . '/.env';
$privateDirectory = dirname($envFile);
$resolvedPrivate = realpath($privateDirectory);
$resolvedSite = realpath($siteRoot);
if (!$resolvedPrivate || !$resolvedSite || str_starts_with($resolvedPrivate . '/', $resolvedSite . '/')) {
    throw new RuntimeException('The environment file must be outside the website directory');
}
Dotenv\Dotenv::createImmutable($privateDirectory, basename($envFile))->safeLoad();

function setting(string $name, string $default = ''): string {
    return (string)($_ENV[$name] ?? $_SERVER[$name] ?? $default);
}

return [
    'enabled' => filter_var(setting('FORM_ENABLED', 'false'), FILTER_VALIDATE_BOOLEAN),
    'allowed_origins' => array_filter(array_map('trim', explode(',', setting('FORM_ALLOWED_ORIGINS')))),
    'recipients' => [
        'contact' => setting('FORM_CONTACT_RECIPIENT'),
        'application' => setting('FORM_APPLICATION_RECIPIENT'),
    ],
    'smtp' => [
        'host' => setting('SMTP_HOST'),
        'port' => (int)setting('SMTP_PORT', '587'),
        'encryption' => setting('SMTP_ENCRYPTION', 'tls'),
        'username' => setting('SMTP_USERNAME'),
        'password' => setting('SMTP_PASSWORD'),
        'from_address' => setting('SMTP_FROM_ADDRESS'),
        'from_name' => setting('SMTP_FROM_NAME', 'Small Heath Park Housing Co-operative'),
    ],
    'secret' => setting('ALTCHA_SECRET'),
    'runtime_dir' => setting('FORM_RUNTIME_DIR', $privateDirectory . '/form-runtime'),
    'rate_limit' => max(1, (int)setting('FORM_RATE_LIMIT', '5')),
    'challenge_limit' => max(1, (int)setting('FORM_CHALLENGE_LIMIT', '60')),
    'max_body_bytes' => 131072,
    'captcha' => [
        'cost' => max(1, (int)setting('ALTCHA_COST', '1000')),
        'max_counter' => max(1, (int)setting('ALTCHA_MAX_COUNTER', '2000')),
        'expires' => max(30, (int)setting('ALTCHA_EXPIRES', '600')),
    ],
];
