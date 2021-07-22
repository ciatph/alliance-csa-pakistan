## alliance-csa-pakistan

> This forked repository serves as a stash for storing the requested updates and follow-up fixes for the original website on https://ciat-dapa.github.io/pakistan_web/.
>
> **Production Site** is available on https://ciatph.github.io/alliance-csa-pakistan  
> **Test Site** is available on https://pakistan-web-dev.web.app

### Content

- [Content](#content)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
  - [Production](#production)
  - [Development](#development)


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
2. If you'll need to add new `html/css/js` files, stop the localhost web server and re-run it again.  
   - (windows cmd) stop the web server.  
`Ctrl + C` 
   - add new `html/css/js` files in the **/public** directory.
   - Restart the localhost web server.  
`npm run dev`


## Deployment

### Production
- Push updates into the `master` branch to trigger GitHub workflows CI/CD to the gh-pages branch. Updates will be viewable on https://ciatph.github.io/alliance-csa-pakistan after the [deployment](https://github.com/ciatph/alliance-csa-pakistan/actions) has finished.
- Alternatively, static files from the `/public` directory can also be hosted from any web server that can serve HTML, CSS, JavaScript and CSV files.

### Development
- Push updates into the `dev` branch to trigger GitHub workflows CI/CD to firebase hosting. Updates will be viewable on https://pakistan-web-dev.web.app after the [deployment](https://github.com/ciatph/alliance-csa-pakistan/actions) has finished.

@ciatph  
20210427