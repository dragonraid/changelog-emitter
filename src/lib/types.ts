export interface Config {
    githubToken: string,
    owner: string,
    repo: string,
}

export interface PullRequest {
    url: string,
    title: string,
    commitSha: string,
}
