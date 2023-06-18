# ffxi-gear-id-extractor
Extracts FFXI gear names and ids to a JSON object.

Filename inclues UNIX epoch timestamp to provide cache-busting when using this file in a web application.

# How to use

Load addon with `//lua load item-list-extractor`

Run `//ile extract` in game

JSON file will be generated in the `data` subfolder which can be manually copied out and hosted on an external server.

Update timestamp on the new items JSON reference in `gearset-format.js` and update that on the external server also.