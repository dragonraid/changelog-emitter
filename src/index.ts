import * as dotenv from "dotenv";
import * as core from '@actions/core';
import { Config } from "./lib/types";
import { Changelog } from "./lib/changelog";

dotenv.config();

const {
    GITHUB_REPOSITORY,
    GITHUB_TOKEN,
} = process.env;

const getConfig = (): Config => {
    if (!GITHUB_REPOSITORY) {
        throw new Error(`GITHUB_REPOSITORY environment variable has wrong format: ${GITHUB_REPOSITORY}`);
    } else if (!GITHUB_TOKEN) {
        throw new Error('GITHUB_TOKEN was not found');
    }

    const ownerAndRepo: Array<string> = GITHUB_REPOSITORY.split('/');
    return {
        branch: core.getInput('branch') || '',
        title: core.getInput('title') || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        prefix: core.getInput('prefix') || '- ',
        githubToken: GITHUB_TOKEN,
        owner: ownerAndRepo[0],
        repo: ownerAndRepo[1],
    };
}

(async () => {
    const config: Config = await getConfig();
    const changelog: Changelog = new Changelog(config);
    console.log(await changelog.run());
})();
