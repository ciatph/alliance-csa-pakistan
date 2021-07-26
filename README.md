## alliance-csa-pakistan

> This forked repository serves as a stash for storing the requested updates and follow-up fixes for the original website on https://ciat-dapa.github.io/pakistan_web/.
>
> **Production Site** is available on https://ciatph.github.io/alliance-csa-pakistan  
> **Test Site** is available on https://pakistan-web-dev.web.app

### Content

- [alliance-csa-pakistan](#alliance-csa-pakistan)
  - [Content](#content)
  - [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Updating](#updating)
- [Deployment](#deployment)
  - [Steps](#steps)
  - [Production](#production)
  - [Development](#development)
- [Credits](#credits)


### Requirements

1. NodeJS v12.16.6
   - v12.16.6 was used for this project but feel free to use other versions

## Installation

1. Clone this repository.  
`git clone https://github.com/ciatph/alliance-csa-pakistan.git`
2. Install dependencies.  
   ```
   cd alliance-csa-pakistan
   npm install
   ```

## Usage

1. Run the localhost development web server.  
`npm run dev`
1. Edit any of the `.html`, `.css` or `.js` files inside the **/public** directory and observe the changes when browser reloads itself.
2. If you'll need to add new `html/css/js` files, first stop the localhost web server, add new the files and re-run it again.
   - (windows cmd) stop the web server.  
`Ctrl + C` 
   - add new `html/css/js` files in the **/public** directory.
   - Restart the localhost web server.  
`npm run dev`

## Updating
- Branch out (create a new branch) from the latest `dev` branch.
   ```
   git fetch
   git checkout dev
   git reset --hard origin dev
   git checkout -b <your_branch_name>
   ```
- Follow the notes on on the [**Usage**](#usage) section to update or apply fixes on the new branch.


## Deployment

### Steps

> Read on the following [Production](#production) and [Development](#development) sections for additional information.

1. (Development) Create a pull request (PR) from your `<your_branch_name>` to the **dev** branch. Read on the [**Updating**](#updating) section for more information on how to create a new branch.
   - Create a PR where source branch: `<your_branch_name>` (i.e., `my-updates`), and target branch: **dev** 
   - Approve the PR.
2. (Production) Create a pull request (PR) from the **dev** branch to the **master** branch.
   - Create a PR where source branch: `dev`, and target branch: `master`.
   - Approve the PR.

### Production
- Only accept PRs originating from the **dev** branch.
- Pushed/merged updates on the `master` branch will trigger a GitHub workflows CI/CD to the gh-pages branch. Updates will be viewable on https://ciatph.github.io/alliance-csa-pakistan after the [deployment](https://github.com/ciatph/alliance-csa-pakistan/actions) has finished.
- Alternatively, static files from the `/public` directory can also be hosted on any web server that can serve HTML, CSS, JavaScript and CSV files.

### Development
- Prerequisites: a new branch containing updates and fixes must have beeen created first before proceeding. (See [**Deployment - Steps #1 (Development)**](#steps) section for more information).
- Accept PRs originating from other branches (i.e., `my-updates`) into the **dev** branch.
- Pushed/merged updates on the `dev` branch will trigger a GitHub workflows CI/CD to firebase hosting. Updates will be viewable on https://pakistan-web-dev.web.app after the [deployment](https://github.com/ciatph/alliance-csa-pakistan/actions) has finished.

## Credits

Many thanks to the CIAT team for their research, and [@stevensotelo](https://github.com/stevensotelo) for creating the original website and laying out an excellent and well-thought of static website groundwork on [pakistan_web](https://github.com/CIAT-DAPA/pakistan_web). The original website is available on [ https://ciat-dapa.github.io/pakistan_web/]( https://ciat-dapa.github.io/pakistan_web/).

@ciatph  
20210726