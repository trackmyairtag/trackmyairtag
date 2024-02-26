# trackmyairtag

The goal of this project is to track the location of your Apple devices and AirTags.

All devices and products that are part of the Find My network can be tracked.

1. Scrapes Find My cache to find the location of your devices & items
2. Puts the data in Postgres
3. Displays the data in a web app

The app will not do 1 & 2 unless it detects it is running on a Mac.
The app will always do 3.

## Usage

Run `docker compose up --build`.
Access the webapp at <http://localhost:8080/>

> [!NOTE]
> You can right click every device on the list to hide/show it on the map.

## Environment
You can set the following environment variables to configure the app.

* `TMA_WHITELIST` is an optional comma separated list of device ids that you want to track.
  * If you don't set this, the app will track all devices and items in the Find My network.
* `TMA_PORT` is an optional port the webapp will listen on.

#### Example
```dotenv
TMA_WHITELIST=1ed6d9fd-4302-4d73-864e-185931c77eca,41907dc5-8a6f-4fd6-a2ed-5dfe3efa0055
TMA_PORT=8080
```

## See also

For great projects relating Find My and AirTag, see:

[fjxmlzn/FindMyHistory](https://github.com/fjxmlzn/FindMyHistory),
[danthelion/airtag-locator](https://github.com/danthelion/airtag-locator),
[hatomist/openhaystack-grafana](https://github.com/hatomist/openhaystack-grafana),
[seemoo-lab/openhaystack](https://github.com/seemoo-lab/openhaystack),
[biemster/FindMy](https://github.com/biemster/FindMy),
