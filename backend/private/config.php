<?php
declare(strict_types=1);

// Composer and .env are above public/, never served by NGINX or GitHub Pages.
require_once dirname(__DIR__) . '/vendor/autoload.php';
Dotenv\Dotenv::createImmutable(dirname(__DIR__))->safeLoad();

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
    'runtime_dir' => __DIR__ . '/runtime',
    'rate_limit' => max(1, (int)setting('FORM_RATE_LIMIT', '5')),
    'challenge_limit' => max(1, (int)setting('FORM_CHALLENGE_LIMIT', '60')),
    'max_body_bytes' => 131072,
    'captcha' => [
        'cost' => max(1, (int)setting('ALTCHA_COST', '1000')),
        'max_counter' => max(1, (int)setting('ALTCHA_MAX_COUNTER', '2000')),
        'expires' => max(30, (int)setting('ALTCHA_EXPIRES', '600')),
    ],
];
