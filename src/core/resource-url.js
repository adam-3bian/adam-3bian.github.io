/** Resolve route data beneath the site's own base, including when hosted in a subdirectory. */
export function routeResourceUrl(path, base) {
    const relative = path.replace(/^\/+/, ''), parts = relative.split('/');
    if (parts.length < 2 || parts[0] !== 'data' || parts.some(part => !/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(part)))
        throw new Error(`Invalid local route data path: ${path}`);
    return new URL(relative, base).href;
}
