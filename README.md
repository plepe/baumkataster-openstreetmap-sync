# baumkataster-openstreetmap-sync
Script to synchronize updates from Vienna Baumkataster into OpenStreetMap

## INSTALLATION
You need [NodeJS](https://nodejs.org) installed.

```sh
git clone https://github.com/plepe/baumkataster-openstreetmap-sync
cd baumkataster-openstreetmap-sync
# You might want to edit conf.json to modify bounding box
npm install # Install dependencies
npm run download-all # Download Baumkataster and OpenStreetMap data
npm run assess # Assess all baumkataster trees in bounding box
npm start # Start the web server to show baumkataster trees
```

Visit http://localhost:3000

To asssess trees in a different area, change the bounding box in conf.json, then run:
```sh
npm run download-openstreetmap
npm run assess
```
