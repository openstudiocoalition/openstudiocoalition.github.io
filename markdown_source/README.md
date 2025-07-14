# OpenStudio Coalition Website

This is the repo for the OpenStudio Coalition Website

The documentation is written in Markdown, and uses [MkDocs] (http://www.mkdocs.org/) to compile the markdown files into a static site.  The site is hosted on github-pages at: https://openstudiocoalition.github.io/.

## Setup
### Mac
Install MkDocs by following the directions at [MkDocs](http://www.mkdocs.org); you will need python.

To install MkDocs on Mac/Linux, run:
```python
# Create a clean virtualenv (optional)
mkvirtualenv mkdocs_osapp
pip install -r requirements.txt
```

### Windows
1. Install [Python 3.8](https://www.python.org/ftp/python/3.8.0/python-3.8.0.exe) with the option to `Add Python 3.8 to PATH`
2. Open a command prompt in the source directory and run: `pip install -r requirements.txt`

## Run
Clone this repo locally.  In a terminal window, navigate to the markdown_source directory, and type:
```shell
mkdocs serve
```

On Windows you can also double-click the start_mkdocs.bat file (assuming you have used standard install locations).

This will start a server that will let you see what your changes will look like on the site.  Open a browser and go to http://127.0.0.1:8000/ to see your local site.


## Adding and Editing Pages
Edit existing .md files using either markdown or html.  If you need to add a new image, place it in the `docs/img` directory.

If you need to add a new page, first decide where it should go in the site structure.  The folders within the docs/ directory mostly correspond to the top nav.  Once you have decided where the page should go, add a reference to it in the `mkdocs.yml` file.

## Deploying

When you are done making changes, then build the site:

```shell
cd markdown_source
/bin/rm -rf site
mkdocs build
cd ..
/bin/rm -Rf !(markdown_source)
cd markdown_source
cp -R site/* ..
cp CNAME ..
```

This will generate the static site in the `site/` directory.  Delete all the files in the root level of the repository except for the markdown_source directory. Then copy the files from the `site/` directory into the root level of the repository.  Add any new files and delete any missing ones from the repo.  Finally your changes the repo, the public site serves the content on the master branch.
