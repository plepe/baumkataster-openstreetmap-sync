# baumkataster-openstreetmap-sync
Script to synchronize updates from Vienna Baumkataster into OpenStreetMap

## INSTALLATION
You need [NodeJS](https://nodejs.org) installed.

```sh
git clone https://github.com/plepe/baumkataster-openstreetmap-sync
cd baumkataster-openstreetmap-sync
# You might want to edit conf.json to modify bounding box
mkdir data dist # Create directory for the data
npm install # Install dependencies
npm run download-all # Download Baumkataster data
npm start # Start the web server to show baumkataster trees
```

Visit http://localhost:3000

To asssess trees in a different area, change the bounding box in conf.json, then run:
```sh
npm run download-openstreetmap
npm run assess
```

## DEVELOPMENT
To rebuild the website's source code, run either `npm run build` or `npm run watch` (including debug symbols).
