import manifest from './manifest.json';

export type AssetId = keyof typeof manifest;
export const assetManifest = manifest;

// Export paths are relative to the static game root, including nested itch.io paths.
export function resolveAssetUrl(id: AssetId, base = import.meta.env.BASE_URL) {
  return `${base}${assetManifest[id].path}`;
}
