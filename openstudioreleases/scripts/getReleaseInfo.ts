import { Octokit } from 'octokit';
import { writeJson } from './writeJson';

// yarn es scripts/getReleaseInfo.ts
const run = async () => {
  const owner = 'openstudiocoalition';
  const repo = 'OpenStudioApplication';

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const { data: releases } = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });

  const allReleases = releases.map(r => ({
    name: r.name,
    tag_name: r.tag_name,
    body: r.body,
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
