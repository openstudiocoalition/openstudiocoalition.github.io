//import { Octokit } from 'octokit';
import { writeJson } from './writeJson';

// yarn es scripts/getReleaseInfo.ts
const run = async () => {
  const owner = 'openstudiocoalition';
  const repo = 'OpenStudioApplication';

  const { Octokit } = await import('octokit');

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const { data: releases } = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });

  const semver = require('semver');
  const filteredReleases = releases.filter((release) => {
    const version = semver.clean(release.tag_name);
    return version && semver.gt(version, "1.9.0");  // TODO: Bump me
  });

  const PR_REGEX = /in https:\/\/github\.com\/openstudiocoalition\/OpenStudioApplication\/pull\/(\d+)/gm;
  const PR_CHANGELOG = /(https:\/\/github\.com\/openstudiocoalition\/OpenStudioApplication\/compare\/(v[\d\.]+)\.\.\.(v[\d\.]+))/gm;
  const GITHUB_USER_REGEX = /by @(\w+) /gm;
  const GITHUB_USER_REGEX2 = /@(\w+) made/gm;

  const allReleases = filteredReleases.map(r => ({
    name: r.name,
    tag_name: r.tag_name,
    published_at: r.published_at,
    prerelease: r.prerelease,
    body: r.body
           .replaceAll(':heavy_check_mark:', '✔️')
           .replaceAll(':heavy_plus_sign:', '➕')
           .replaceAll(PR_REGEX, 'in [#$1](https://github.com/openstudiocoalition/OpenStudioApplication/pull/$1)')
           .replaceAll(GITHUB_USER_REGEX, 'by [@$1](https://github.com/$1) ')
           .replaceAll(GITHUB_USER_REGEX2, '[@$1](https://github.com/$1) made')
           .replaceAll(PR_CHANGELOG, '[$2...$3]($1)'),
    assets: r.assets.map(a => ({
      url: a.url,
      name: a.name,
      browser_download_url: a.browser_download_url,
    })),
  }));

  await writeJson('src/releases/releases', allReleases);
};

(async () => {
  try {
    await run();
  } catch (err) {
    // eslint-disable-next-line
    console.log({
      err,
    });
    process.exit(1);
  }

  process.exit(0);
})();
