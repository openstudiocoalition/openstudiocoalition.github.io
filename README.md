# OpenStudio Coalition Website

This is the repo for the OpenStudio Coalition Website

The documentation is written in Markdown in the `markdown_source` directory, and uses [MkDocs] (http://www.mkdocs.org/) to compile the markdown files into a static site.  The login and downloads page is a separate web app in the `openstudioreleases`  The site is hosted on github-pages at: https://openstudiocoalition.github.io/.

The static webpage is hosted directly off the main branch of the `https://github.com/openstudiocoalition/OpenStudioApplication/` repo.  This means that the webpage must be built and the static site checked in to the root directory of the repository.

## Clean
At the root level of the repo, delete all files except `.git`, `.gitignore`, `CNAME`, `README.md`, `markdown_source`, and `openstudioreleases`.

# Build MkDocs
Follow the instructions in `markdown_source/README.md` to build the markdown site in the `markdown_source\site` directory.  Copy the contents of the `markdown_source\site` to the root directory of this repository.

# Build OpenStudio Releases
Follow the instructions in `openstudioreleases/README.md` to build the OpenStudio Releases site in the `openstudioreleases\dist` directory.  Copy the contents of the `openstudioreleases\dist` to the root directory of this repository.

# Test
Install (http-server)[https://www.npmjs.com/package/http-server] using `https://www.npmjs.com/package/http-server`.  From the root directory, run `http-server`.  This is how the webpage will be hosted on GitHub Pages.