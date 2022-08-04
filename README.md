# MSMC Chrome

[MSMC](https://github.com/Hanro50/MSMC) As a chrome extension for [Prismarine Web Client](https://github.com/PrismarineJS/prismarine-web-client) to enable online mode.

## Custom Prismarine instance

Due to a limitation in chrome's manifest v3, you need to download the extension source, compile it and add the Prismarine instance to the Externally Connectable list in `extension/manifest.json`

Example: 
```json
{
  ...
  "externally_connectable": {
    "matches": ["https://your-prismarine.instance/*"]
  },
  ...
}
```

A custom extension can be used by going to `chrome://extensions`, enabling developer mode and then selecting the folder by clicking load unpacked.

Sometimes, you may need to update the extension id in Prismarine Web Client, copy the extension id on `chrome://extensions` and paste this into your prismarine config.

## Compiling for development

To use MSMC Chrome, you need to compile the browserified MSMC first.

To do this, first install all dependencies by running `npm install`, secondly you can run `npm run build`to compile MSMC.

## License

MSMC is licensed under the [MIT License](MSMC/LICENSE)