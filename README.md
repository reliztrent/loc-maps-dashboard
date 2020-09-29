# Maps Dashboard

This repo contains files used to build the GitHub pages site at https://reliztrent.github.io/loc-maps-dashboard/. The site is built using Jekyll, which integrates with GitHub pages. The Jekyll pages are kept in the **/docs** directory. Many of the basic configurations for the site can be found in **/docs/\_config.yml**. 

To learn more about how to get started with GitHub Pages, try Github's [Getting Started with GitHub Pages](https://guides.github.com/features/pages/). 

If duplicating this repo, you'll need to:

- Update the **/docs/\_config.yml** file with new variables in **baseurl**, **github_repo**, and **github_username**. If your site has its own domain, update the **url** variable. 
- Click on your GitHub profile icon > **Settings** > **Developer settings** > **Personal access tokens**. Click the button **Generate new token**. Name the token anything you like, and check the **repo** box (this will also check all the boxes under repo). Save and copy the token. 
- Go to your repo and click **Settings** > **Secrets** and click on the **New secret** button. Name the new secret **BUILD_AND_DEPLOY_ACTION_ACCESS_TOKEN** and paste in your token. (If you don't name it **BUILD_AND_DEPLOY_ACTION_ACCESS_TOKEN**, then you'll need to edit the workflow files to change the name of the secrets token to the one you've used.)
- Go to your repo and click **Settings**. Scroll down to the section that says **GitHub Pages**. Under "GitHub Pages", use the **None** or **Branch** drop-down menu and select **master**. From the **/root** drop-down menu, select **/docs**. The URL to your site will be https://your-github-username.github.io/your-repo-name/. You can also read official documentation from Github's [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Data Updates

Daily, this repo queries and saves various map-related data from [loc.gov](http://loc.gov). This is achieved through a series of workflow files in the directory **.github/workflows/**. Each workflow file runs a cron jobs every evening just after midnight (or just after midnight after the first day of every month). The cron jobs make API requests to the [loc.gov](http://loc.gov) API and save the resulting JSON files into subdirectories within this repo's **/docs/\_data/ directory**.  

These workflows use the [Fetch API Data Action](https://github.com//JamesIves/fetch-api-data-action) and [GitHub Pages Deploy Action](https://github.com/JamesIves/github-pages-deploy-action), pr the local **loc_json.py** file (in this repo) and a GitHub Actions Python workflow. A log of all the workflows run in the past can be found in the [Actions](actions) tab of this repo.

Each workflow is a .yml file, and each makes a different type of API request. New data from the API requests is saved into files named by date and appended with \_TODAY or \_THISMONTH. Each night, when the workflow runs, if the data is different from the night before (or, for monthly requests, when the workflow runs monthly and if the data is different from the month before), then the \_TODAY (or \_THISMONTH) file is overwritten with the new data. 

Workflows such as these can be created by creating files in **.github/workflows/**, or by clicking the **Actions** tab in your github repo. The workflows also require you to make a GitHub access token (very easy to do), to give the workflow the ability to push to your repo (see instructions above).

## D3 Visualizations and Liquid
 
The workflows save data received from the [loc.gov](http://loc.gov) API in the form of JSON files in the **/docs/\_data directory**. Files in the **/docs/data** directory (notice the change in underscore) are then used to restructure the JSON for the D3 visualizations. The files in **/docs/data** use Liquid templating language (documented [here](https://jekyllrb.com/docs/liquid/) and [here](https://shopify.github.io/liquid/)) to pull from the **/docs/\_data** files. Open the files in this repo to see the Liquid syntax (e.g., [/docs/data/all-facet-partof.json](/docs/data/all-facet-partof.json)), or view them at their GitHub Pages URL to see them as JSON after their Jekyll build (e.g., https://reliztrent.github.io/loc-maps-dashboard/data/all-facet-partof.json).

The visualizations (charts and graphs) are then built using [D3](https://github.com/d3/d3/wiki) JavaScript library for data visualizations. Each visualization is configured in its own file in the **/\_includes/ directory** (the files are saved as .html for Jekyll purposes). Each includes file is then included at the bottom of the index.html file with a [Jekyll includes statement](https://jekyllrb.com/docs/includes/): 

```
{% include d3-maps-partof.html %}
```

The D3 library is pulled from CDN, in the index.html file:

```
<script src="//d3js.org/d3.v4.min.js"></script>
```

In summary, the flow of data being converted to visualization (after being initially retrieved with the workflow files in /.github/workflows/) is:

> /docs/\_data/\*.json &rarr; /docs/data/\*.json &rarr; /docs/\_includes/\*.html &rarr; /docs/index.html

## LOC.GOV API

The data comes from the online collections at [loc.gov](http://loc.gov). Documentation on the platform's API can be found at [About the loc.gov JSON API](https://libraryofcongress.github.io/data-exploration/). The API queries used for this site can be found in the workflow files in **.github/workflows/**. The JSON returned from the API also sometimes contains the query request string, found in the JSON files saved into **/docs/_data/**