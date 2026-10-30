<?php
// Run hourly from cron. Only hashed technical records are stored here.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit(1);
$config = require __DIR__ . '/config.php';
foreach (glob($config['runtime_dir'] . '/*.json') ?: [] as $path) {
    $handle = fopen($path, 'r+');
    if (!$handle) continue;
    // Never remove a record in use by an active request.
    if (flock($handle, LOCK_EX | LOCK_NB)) {
        clearstatcache(true, $path);
        if (filemtime($path) < time() - 172800) unlink($path);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
}
