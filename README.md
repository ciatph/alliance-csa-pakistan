## pakistan_web_dev

> This forked repository serves as a personal stash for storing the requested updates and follow-up fixes for the original website on https://ciat-dapa.github.io/pakistan_web/.
>
> Test Site is available on https://ciatph.github.io/pakistan_web_dev. 

### Content

- [Content](#content)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)


### Requirements

1. NodeJS v12.16.6
   - v12.16.6 was used for this project but feel free to use other versions

## Installation

1. Clone this repository.  
`git clone https://github.com/ciatph/pakistan_web_dev.git`
2. Install dependencies.  
   ```
   cd pakistan_web_dev
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

Push updates into the dev branch to trigger GitHub workflows ci/cd to the gh-pages branch. Updates will be viewable on https://ciatph.github.io/pakistan_web_dev after the deployment has finished.

@ciatph  
20210427