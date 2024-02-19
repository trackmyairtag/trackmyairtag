const map = L.map('map', { zoomControl: false }).setView([41.90, 12.49], 3, {
    zoomControl: false
});

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let markers = {};
let group = L.featureGroup();
let airtagsDiv = document.getElementById("airtags");
const trails = [];

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
                    markers[airtag.id] = L.marker([airtag.latitude, airtag.longitude]).addTo(map)
                        .bindPopup(`
                                    <h2>${airtag.name}</h2>
                                    <p>${airtag.address}</p>
                                    <p>${airtag.ago}</p>
                                `);
                    group.addLayer(markers[airtag.id]);
                }
                // Create an element in airtagsDiv
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
                    airtagsDiv.appendChild(airtagDiv);
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
    allAirTagLocations = [];
    promises = [];

    for (const device of document.getElementsByClassName('device')) {
        promises.push(fetch(`/api/db/trail/${device.id}`)
            .then(response => response.json())
            .then(data => {
                const locations = data.map(airtag => [airtag.latitude, airtag.longitude]);

                allAirTagLocations.push(locations)
            }));
    }

    Promise.all(promises).then(() => {
        // Removing all trails before adding updated ones
        trails.forEach(trail => {
            map.removeLayer(trail);
        });

        allAirTagLocations.forEach(locations => {
            const polyline = L.polyline([], {
                color: '#C46BAE'
            });

            const sortedLocations = locations.sort((a, b) => a.timestamp - b.timestamp);

            polyline.setLatLngs(sortedLocations);
            polyline.addTo(map);
            trails.push(polyline);
        });
    });
}

// When the page loads, update the markers
document.addEventListener('DOMContentLoaded', () => {
    Promise.all([updateMarkers()])
        .then(() => {
            createAirtagTrail();
        });
    setInterval(function () {
        Promise.all([updateMarkers()])
            .then(() => {
                createAirtagTrail();
            });
    }, 10000);
});
