import * as dotenv from 'dotenv';
import * as core from '@actions/core';
import { Config } from './lib/types';
import { Changelog } from "./lib/changelog";

dotenv.config();

const {
    GITHUB_REPOSITORY,
    GITHUB_TOKEN,
} = process.env;

const getConfig = (): Config => {
    const branch = core.getInput('branch') || '';
    const title = core.getInput('title') || new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const prefix = core.getInput('prefix') || '-';
    const githubToken = core.getInput('token') || GITHUB_TOKEN;
    let owner = core.getInput('owner');
    let repo = core.getInput('repo');

    if (GITHUB_REPOSITORY && (!owner || !repo)) {
        const ownerAndRepo: Array<string> = GITHUB_REPOSITORY.split('/');
        owner = ownerAndRepo[0];
        repo = ownerAndRepo[1];
    } else {
        throw new Error(`Either GITHUB_REPOSITORY environment variable or "owner" and "repo" input must be set.`);
    }

    if (!githubToken) {
        throw new Error('Either GITHUB_TOKEN environment variable or "token" input must be set');
    }
    return {
        branch,
        title,
        prefix,
        githubToken,
        owner,
        repo,
    };
};

(async () => {
    try {
        core.info('Starting...');
        const config: Config = await getConfig();
        const changelog: Changelog = new Changelog(config);
        const changelogBody: string = await changelog.run();
        core.info(`Changelog:\n${changelogBody}`);
        core.setOutput('changelog', changelogBody);
        core.exportVariable('CHANGELOG', changelogBody);
        core.info('Finished!');
    } catch (error) {
        core.setFailed(`Failed to update changelog due to: ${error}`);
    }
})();
