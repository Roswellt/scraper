# Scraper Client
## Run locally
Download nodejs and yarn if not yet installed
Run `yarn` to update dependencies
Run `yarn start` to start React Native server

### Modifying server URL
Before running the client, the server url has to be added
In the client/utils/constants.js folder replace the URL = <URL_HERE> with -> http://<IP_OF_DEVICE_RUNNING_SERVER>:8080

Ex. `http://192.168.2.210:8080` where `192.168.2.210` is the IP of my PC


### Using server hosted on GCP instead of local server
Or keep `https://scraper-260404.appspot.com/` to use the publicly hosted server

### Android
Download the expo app and scan the QR code

### IOS
Scan QR using camera
