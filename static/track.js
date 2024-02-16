const map = L.map('map', { zoomControl: false }).setView([41.90, 12.49], 3, {
    zoomControl: false
});

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);
let markers = {};
let group = L.featureGroup();
let airtagsDiv = document.getElementById("airtags");
let polyline = L.polyline([], {
    color: 'red'
}).addTo(map);

function updateMarkers() {
    return fetch('/api/db/latest')
        .then(response => response.json())
        .then(data => {
            console.log(data);
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
                                <img src="${airtag.image}" alt="device" />
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
    for (const airtagDiv of document.getElementsByClassName('airtag')) {
        const id = airtagDiv.id;
        console.log(id);
        const trailCheckbox = airtagDiv.querySelector('#trail');
        if (trailCheckbox.checked) {
            promises.push(fetch(`/api/db/trail/${id}`)
                .then(response => response.json())
                .then(data => {
                    data.forEach(airtag => {
                        allAirTagLocations.push(airtag);
                    });
                }));
        }
    }
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
