import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";


dotenv.config();

const octokit: Octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

(async () => {
    const commits: any = await octokit.rest.pulls.list({
        owner: 'dragonraid',
        repo: 'test',
        state: 'all',
    });
    console.log(JSON.stringify(commits, null, 4));
})();
