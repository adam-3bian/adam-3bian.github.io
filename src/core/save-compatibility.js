/** Only releases whose operating geometry and simulation contract are known to
 * match may reuse a saved world under a newer presentation/build hash. */
const compatibleReleases = new Map([
    // Prefab construction is opt-in; the existing route and simulation are unchanged.
    ['5ceb8ffcf5bab44eb08e6ec0fa512849f1973704b10a445edaf1ebc3ac3e9f5f', '2903b3d30210cbcde18aa97ee742c7ac4617df3323525779c83bfc4b79150000'],
    ['75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30', 'a972112cc7694560042b4ee0f85b3fd92ecf55613803f17b5207fc876e086ec4'],
]);

export function mayUsePreviousWorld(snapshot) { return snapshot?.version===2 && compatibleReleases.has(snapshot.worldHash); }

export function canUseSavedWorld(snapshot, world) {
    const revision=compatibleReleases.get(snapshot?.worldHash);
    return Boolean(snapshot?.version===2 && revision && world?.document?.schema===1 && world.document.revision===revision && world.terrain instanceof ArrayBuffer && world.tiles && typeof world.tiles==='object');
}

/** Do not mutate the stored snapshot; the normal atomic save preserves it as a
 * backup before writing the upgraded one. Different layouts remain rejected. */
export function reconcileSavedJourney(snapshot, document, routeFingerprint, currentHash) {
    if (snapshot?.worldHash === currentHash) return snapshot;
    const revision=compatibleReleases.get(snapshot?.worldHash);
    if (snapshot?.version !== 2 || !revision || document?.revision !== revision || snapshot.routeFingerprint !== routeFingerprint)
        throw new Error('This save belongs to a different railway layout. Its stored journey has been preserved.');
    return {...snapshot,worldHash:currentHash};
}
