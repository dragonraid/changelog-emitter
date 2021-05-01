import { Config } from "./lib/types";
import { Changelog } from "./lib/changelog";
import * as dotenv from "dotenv";

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
