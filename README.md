# Event Codelab

This is part 1 source code of [codelabs-custom-event](https://github.com/AdobeDocs/adobeio-codelabs-custom-event):

* Step 1: use this repo to register your app as event provider
* Step 2: Project firefly app custom event codelab code can be found [here](https://github.com/AdobeDocs/adobeio-codelab-customevent-demo)
 

## Setup
- Rename `dotenv` file to `.env`
- Populate the `.env` file in the project root and fill it with information from console integration in codelab lesson 1
- Run in terminal 
```bash
export EVENTS_INGRESS_URL='https://eventsingress.adobe.io'
export EVENTS_BASE_URL='https://api.adobe.io'
```

## Run
```bash
npm install
```
```bash
npm start
```
to execute `index.js` file, wait for a few mins, you should be able to see your event provider in console 
