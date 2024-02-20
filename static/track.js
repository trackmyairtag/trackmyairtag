const map = L.map('map', { zoomControl: false }).setView([41.90, 12.49], 3, { zoomControl: false });
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const trails = new Map();
const hiddenDevices = new Set();
const markers = {};
const devicesContainer = document.getElementById("devices");

function updateMarkers() {
    return fetch('/api/db/latest')
        .then(response => response.json())
        .then(data => {
            data.forEach(airtag => {
                const marker = markers[airtag.id];
                if (marker) {
                    marker.setLatLng([airtag.latitude, airtag.longitude]);
                    marker.setPopupContent(`
                        <h2>${airtag.name}</h2>
                        <p>${airtag.address}</p>
                        <p>${airtag.ago}</p>
                    `);
                } else {
                    markers[airtag.id] = L.marker([airtag.latitude, airtag.longitude], {
                        icon: L.divIcon({
                            className: 'device-marker',
                            html: !airtag.image
                                ? `<span>${airtag.icon}</span>`
                                : `<img src="${airtag.image}" alt="device" />`,
                            popupAnchor: [0, -20],
                            iconSize: [40, 40]
                        })
                    });

                    markers[airtag.id].addTo(map);
                    markers[airtag.id].bindPopup(`
                        <h2>${airtag.name}</h2>
                        <p>${airtag.address}</p>
                        <p>${airtag.ago}</p>
                    `);

                    if (!hiddenDevices.has(airtag.id))
                        map.addLayer(markers[airtag.id]);
                }
                // Create an element in devicesContainer
                // Check if it exists, if not create it

                let does_exist = document.getElementById(airtag.id);
                if (does_exist) {
                    does_exist.getElementsByTagName("h3")[0].innerHTML = airtag.name;
                    does_exist.getElementsByTagName("p")[0].innerHTML = airtag.address;
                    does_exist.getElementsByTagName("p")[1].innerHTML = airtag.ago;
                } else {
                    let airtagDiv = document.createElement("div");
                    airtagDiv.id = airtag.id;
                    airtagDiv.className = "device";
                    airtagDiv.innerHTML = `
                        ${!airtag.image
                            ? `<span>${airtag.icon}</span>`
                            : `<img src="${airtag.image}" alt="device" />`
                        }
                        <div>
                            <h3 class="center" id="name">${airtag.name}</h2>
                            <p id="address">${airtag.address}</p>
                            <p id="ago">${airtag.ago}</p>
                        </div>
                    `;
                    devicesContainer.appendChild(airtagDiv);

                    airtagDiv.addEventListener('contextmenu', e => {
                        e.preventDefault();

                        const trail = trails.get(airtag.id);
                        if (!trail)
                            return;

                        if (hiddenDevices.has(airtag.id)) {
                            hiddenDevices.delete(airtag.id);
                            map.addLayer(trail);
                            map.addLayer(markers[airtag.id]);

                        } else {
                            hiddenDevices.add(airtag.id);
                            map.removeLayer(trail);
                            map.removeLayer(markers[airtag.id]);
                        }

                        airtagDiv.classList.toggle('hidden');
                        
                    });

                    airtagDiv.addEventListener('click', () => {
                        const marker = markers[airtag.id];
                        map.flyTo(marker.getLatLng(), 12, {
                            duration: 0.25,
                        });
                        marker.openPopup();
                    });
                }
            });
        });
}

function createAirtagTrail() {
    const allAirTagLocations = new Map();
    const promises = [];

    for (const device of document.getElementsByClassName('device')) {
        promises.push(fetch(`/api/db/trail/${device.id}`)
            .then(response => response.json())
            .then(data => {
                const locations = data.map(airtag => [airtag.latitude, airtag.longitude]);

                allAirTagLocations.set(device.id, locations);
            }));
    }

    Promise.all(promises).then(() => {
        // Removing all trails before adding updated ones
        trails.forEach((trail, _) => {
            map.removeLayer(trail);
        });

        allAirTagLocations.forEach((locations, id) => {
            const sortedLocations = locations.sort((a, b) => a.timestamp - b.timestamp);
            const polyline = L.polyline([], {
                color: 'red'
            });

            polyline.setLatLngs(sortedLocations);
            
            if (!hiddenDevices.has(id))
                polyline.addTo(map);

            trails.set(id, polyline);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const updateAll = () => {
        console.info('Updating all devices...');
        console.info({ hiddenDevices });

        updateMarkers().then(createAirtagTrail);
    };

    setInterval(updateAll, 10000);
    updateAll();
});
