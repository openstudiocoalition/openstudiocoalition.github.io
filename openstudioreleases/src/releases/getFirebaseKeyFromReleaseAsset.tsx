import type { AssetsItem, Release } from './ReleaseInfo';

export const isExecutable = (filename: string) => {
  return ['.exe', '.dmg', '.deb'].some(ext => filename.includes(ext));
}

export const getFirebaseKeyFromReleaseAsset = (release: Release, asset: AssetsItem) => {
  // firebase does not handle executable files well
  if (isExecutable(asset.name)) {
    return `assets/${release.tag_name}/${asset.name}.zip`;
  }

  return `assets/${release.tag_name}/${asset.name}`;
};