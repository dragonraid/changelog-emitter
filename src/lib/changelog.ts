import { Octokit } from '@octokit/rest';
import { Config, PullRequest } from './types';

const NUMBER_OF_TAGS_TO_BE_FETCHED = 1;
const PULL_REQUEST_STATE = 'closed';
const RESULTS_PER_PAGE = 100;

export class Changelog {
    private branch: string;
    private commits: Array<string>
    private commitPage: number;
    private config: Config;
    private latestTagCommit: string;
    private octokit: Octokit;
    private pullRequests: Array<PullRequest>;
    private pullRequestPage: number;

    public constructor(config: Config) {
        this.branch = '';
        this.commits = [];
        this.commitPage = 0;
        this.config = config;
        this.latestTagCommit = '';
        this.octokit = new Octokit({
            auth: config.githubToken,
        })
        this.pullRequests = [];
        this.pullRequestPage = 0;
    }

    public async run(): Promise<string> {
        await this.setBranch()
        await this.getLatestTag();
        await this.getCommits();
        await this.getPullRequests();
        return await this.generateChangelog();
    }

    /**
     * Set default branch used in getCommits and getPullRequests
     * TODO: param for set branch
     */
    private async setBranch(): Promise<void> {
        const repository: any = await this.octokit.rest.repos.get({
            owner: this.config.owner,
            repo: this.config.repo,
        });
        this.branch = repository.default_branch;
    }

    /**
     * Get latest tag
     */
    private async getLatestTag(): Promise<void> {
        const tags: any = await this.octokit.rest.repos.listTags({
            owner: this.config.owner,
            repo: this.config.repo,
            per_page: NUMBER_OF_TAGS_TO_BE_FETCHED,
        });
        this.latestTagCommit = tags.data[0].commit.sha;
    }

    /**
     * Get commits. This function is not idempotent as with each call it increments page parameter.
     */
    private async getCommits(): Promise<void> {
        const rawCommits: any = await this.octokit.rest.repos.listCommits({
            owner: this.config.owner,
            repo: this.config.repo,
            sha: this.branch,
            per_page: RESULTS_PER_PAGE,
            page: this.commitPage,
        });
        const commits: Array<string> = rawCommits.data.map((commit: any) => commit.sha);
        this.commits = this.commits.concat(commits);
        this.commitPage++;
    }

    /**
     * Get pull requests. This function is not idempotent as with each call it increments page parameter.
     */
    private async getPullRequests(): Promise<void> {
        const rawPullRequests: any = await this.octokit.rest.pulls.list({
            owner: this.config.owner,
            repo: this.config.repo,
            base: this.branch,
            state: PULL_REQUEST_STATE,
            per_page: RESULTS_PER_PAGE,
            page: this.pullRequestPage,
        });

        const mergedPullRequests: any = rawPullRequests.data.filter(
            (pullRequest: any) => pullRequest.merged_at,
        );

        const pullRequests: Array<PullRequest> = mergedPullRequests.map(
            (pullRequest: any) => {
                return {
                    url: pullRequest.html_url,
                    title: pullRequest.title,
                    commitSha: pullRequest.merge_commit_sha,
                }
            }
        );

        this.pullRequests = this.pullRequests.concat(pullRequests);
        this.pullRequestPage++;
    }

    private async generateChangelog(): Promise<string> {
        // TODO: date
        let changelog = 'Date';
        let indexOfTag: number;

        // If index not found fetch more commits
        for(;;) {
            indexOfTag = this.commits.indexOf(this.latestTagCommit);
            if (indexOfTag === -1) {
                await this.getCommits();
            } else {
                break;
            }
        }

        for(let i = 0;; i++) {
            const indexOfPullrequest: number = this.commits.indexOf(this.pullRequests[i].commitSha);
            if (indexOfPullrequest === -1 || indexOfPullrequest > indexOfTag) {
                break;
            } else if (i === this.pullRequests.length -1) {
                await this.getPullRequests();
            } else {
                changelog += `\n${this.pullRequests[i].title}`;
            }
        }

        return changelog;
    }
}
