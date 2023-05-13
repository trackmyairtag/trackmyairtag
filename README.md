# trackmyairtag

1. Scrapes Find My cache to find the location of your devices & items
2. Puts the data in Postgres
3. Displays the data in a web app

The app will not do 1 & 2 unless it detects it is running on a Mac.
The app will always do 3.

## Usage

Run `docker compose up --build`.
Access the webapp at <http://localhost:8080/>
(or using a custom port set by environment variable `TMA_PORT`).

## See also

For great projects relating Find My and AirTag, see:

[fjxmlzn/FindMyHistory](https://github.com/fjxmlzn/FindMyHistory),
[danthelion/airtag-locator](https://github.com/danthelion/airtag-locator),
[hatomist/openhaystack-grafana](https://github.com/hatomist/openhaystack-grafana),
[seemoo-lab/openhaystack](https://github.com/seemoo-lab/openhaystack),
[biemster/FindMy](https://github.com/biemster/FindMy),
