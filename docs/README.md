# LOC Maps Dashboard

This repo contains files used to build the GitHub pages site at https://reliztrent.github.io/loc-maps-dashboard/. The site is built using Jekyll, which integrates by default with GitHub pages. The Jekyll pages are keps in the /docs directory. Many of the basic configurations for the site can be found in /docs/\_config.yml . 

## Jekyll Theme

The site uses the Jekyll theme [Swiss](https://github.com//broccolini/swiss). A demo can be found at https://broccolini.net/swiss/. The theme is installed via the /docs/\_config.yml file.

## GitHub Pages

This repo runs the GitHub Pages site at https://reliztrent.github.io/loc-maps-dashboard/. To learn more about how to get started with GitHub Pages, try https://guides.github.com/features/pages/. 

If duplicating this repo, you'll need to:

- Update the /docs/\_config.yml file with new variables in baseurl, github_repo, and github_username. If your site has its own domain, update the url variable.
- Click on your GitHub profile icon > _Settings_ > _Developer settings_ > _Personal access tokens_. Click the button _Generate new token_. Name the token anything you like, and check the _repo_ box (this will also check all the boxes under repo). Save and copy the token. 
- Go to your repo and click _Settings_ > _Secrets_ and click on the _New secret_ button. Name the new secret _BUILD_AND_DEPLOY_ACTION_ACCESS_TOKEN_ and paste in your token. (If you don't name it _BUILD_AND_DEPLOY_ACTION_ACCESS_TOKEN_, then you'll need to edit the workflow files to change the name of the secrets token to the one you've used.)

## Data Updates

Daily, this repo saves JSON data from loc.gov. This is achieved through a series of workflow files in the directory .github/workflows/. These workflows run cron jobs every evening just after evening, and the first day of every month. The cron jobs make API requests to the loc.gov api and save the resulting JSON files in the repo's /docs/\_data directory.  

These workflows use the [Fetch API Data Action](https://github.com//JamesIves/fetch-api-data-action) and [GitHub Pages Deploy Action](https://github.com/JamesIves/github-pages-deploy-action) from James Ives.

Each workflow is a .yml file, and each makes a different type of API request. New data is saved by date and appended with \_TODAY or \_THISMONTH, which is overwritten daily or monthly.

These workflows can be created by creating files in .github/workflows/, or by clicking the "Actions" tab in your github repo. They require that you make an easy-to-create access token, to give the workflow the ability to push to your repo.

## D3 Visualizations
 
The workflows first say JSON into the /docs/\_data directory, as received from the loc.gov API. Files in the /docs/data directory are used to restructure the JSON into simpler JSON files for the D3 visualizations. The files in /data use Liquid template language (documented [here](https://jekyllrb.com/docs/liquid/) and [here](https://shopify.github.io/liquid/)) to pull from the /docs/\_data files. Open the files in this repo to see the Liquid syntax (e.g., [/docs/data/all-facet-partof.json](/docs/data/all-facet-partof.json)), and view them at their Pages URL to view them as rendered after the Jekyll build (e.g., https://reliztrent.github.io/glam-data/data/all-facet-partof.json ).

The visualizations (charts and graphs) are then built using [D3](https://github.com/d3/d3/wiki) JavaScript library for data visualizations. Each visualization is made in a file in the /\_includes/ directory (the files are saved as .html for Jekyll purposes). Each includes file is then included at the bottom of the index.html file with a Jekyll includes statement: 

```
{% include d3-maps-partof.html %}
```

The D3 library is included from CDN, in the index.html file:

```
<script src="//d3js.org/d3.v4.min.js"></script>
```

The flow of data to visualizations (after being initially retrieved with the workflow files in /.github/workflows/) is:

> /docs/\_data/\*.json &rarr; /docs/data/\*.json &rarr; /docs/\_includes/\*.html &rarr; /docs/index.html

## LOC.GOV API

The data comes from the Library of Congress's online collections platform loc.gov. Documentation on the platform's API can be found at [About the loc.gov JSON API](https://libraryofcongress.github.io/data-exploration/)