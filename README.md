# changelog-generator

This github action creates changelog from pull request titles. It takes titles of pull requests
between latest tag and branches HEAD.

## Inputs

| Input  |                               Description |               Example |                                                    Default | Required |
| :----- | ----------------------------------------: | --------------------: | ---------------------------------------------------------: | -------: |
| branch |               base branch of pull request |              `master` |                                repositories default branch |       no |
| title  |                           changelog title |           `Changelog` |                                          date `YYYY/MM/DD` |       no |
| prefix | prefix of pull request title in changelog |                   `*` |                                                        `-` |       no |
| token  |              github personal access token |             `ghe_xyz` |                                `GITHUB_TOKEN` env variable |       no |
| owner  |       owner or organizatoin of repository |          `dragonraid` | `GITHUB_REPOSITORY` environment variable (part before `/`) |       no |
| repo   |                                repository | `chnagelog-generator` |  `GITHUB_REPOSITORY` environment variable (part after `/`) |       no |

## Output

| Output    |       Description |
| :-------- | ----------------: |
| changelog | text of changelog |

Text of changelog can also be accessed in subsequent steps via `CHANGELOG` environment variable.

## Example

```yaml
name: create changelog

on:
  push:
    branches:
      - main

jobs:
  changelog:
    runs-on: ubuntu-20.04
    steps:
      - name: create changelog
        id: step
        uses: dragonraid/changelog-generator
```
