import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config();

const {
    GITHUB_REPOSITORY,
    GITHUB_TOKEN,
} = process.env;

const PULL_REQUEST_STATE = 'all';
const NUMBER_OF_TAGS_TO_BE_FETCHED = 1;

const octokit: Octokit = new Octokit({
    auth: GITHUB_TOKEN,
});

interface Config {
    owner: string,
    repo: string,
}

interface PullRequest {
    url: string,
    title: string,
    isMerged: boolean,
}

/**
 * Check if PR was merged.
 * response: "Status: 204 No Content" === merged
 * response: "Status: 404 Not Found" === not merged
 * @param owner
 * @param repo
 * @param pullRequest
 */
const checkIfPullRequestIsMerged = async (owner: string, repo: string, pullRequest: any): Promise<PullRequest> => {
    let isMerged: boolean;
    try {
        await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
            owner,
            repo,
            pull_number: pullRequest.number,
        });
        isMerged = true;
    } catch (error) {
        isMerged = false;
    }

    return {
        url: pullRequest.html_url,
        title: pullRequest.title,
        isMerged,
    }
}

const getConfig = (): Config => {
    if (!GITHUB_REPOSITORY) {
        throw new Error(`GITHUB_REPOSITORY environment variable has wrong format: ${GITHUB_REPOSITORY}`);
    } else if (!GITHUB_TOKEN) {
        throw new Error('GITHUB_TOKEN was not found');
    }
    const ownerAndRepo: Array<string> | undefined = GITHUB_REPOSITORY.split('/');
    return {
        owner: ownerAndRepo[0],
        repo: ownerAndRepo[1],
    };
}

(async () => {
    const config: Config = getConfig();
    const pullRequests: any = await octokit.rest.pulls.list({
        owner: config.owner,
        repo: config.repo,
        state: PULL_REQUEST_STATE,
    });

    const tags: any = await octokit.rest.repos.listTags({
        owner: config.owner,
        repo: config.repo,
        per_page: NUMBER_OF_TAGS_TO_BE_FETCHED,
    });

    // TODO: filter out drafts
    const checkPullRequestPromise: Array<Promise<PullRequest>> = pullRequests.data.map(
        (pullRequest: any) => checkIfPullRequestIsMerged(config.owner, config.repo, pullRequest)
    );
    const mergedPullRequests: Array<PullRequest> = await Promise.all(checkPullRequestPromise);
    console.log(JSON.stringify(mergedPullRequests, null, 4));
    console.log(JSON.stringify(tags, null, 4));

    /**
     * To get PRs only until last tag
     * - list PRs
     * - list tags
     * - list commits
     * - pair commit and tags => get date => include only PRs younger than
     */
})();
