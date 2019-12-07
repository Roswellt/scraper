# Scraper server
## Running locally
1. Install nodejs and yarn
2. Run `yarn` to install all dependencies
3. Add the .env file found in the zip into this folder
4. `yarn start` to run server

## Routes
Once the server has started then the following routes are available on localhost:8080

`http://localhost:8080/clients` ----> Navigate here to add yourself as a client
`http://localhost:8080/scraper-job?url=<URL_HERE>` -----> Replace <URL_HERE> with the url to scrape, leaving out https://
Ex. http://localhost:8080/scraper-job?url=httpbin.org

### Mobile Client
Follow the steps in the /scraper/client folder to start the React Native application to use a mobile device as a scraper client.

## Changing picking algorithm
Add the following line in the .env file depending on which algorithm to run
`ALGORITHM=CUSTOM` For the custom algorithm
`ALGORITHM=PABFD` For the Power Aware Best Fit Decreasing algorithm
`ALGORITHM=RR` For the Round Robin algorithm

## Using the server hosted on GCP
`https://scraper-260404.appspot.com/clients` ----> Navigate here to add yourself as a client
`https://scraper-260404.appspot.com/scraper-job?url=<URL_HERE>` -----> Replace <URL_HERE> with the url to scrape, leaving out https://