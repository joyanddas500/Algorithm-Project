// Initialize Map
var map = L.map('map').setView([23.8103, 90.4125], 10); // Default: Dhaka

// Load OpenStreetMap Tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Routing Control with Multiple Route Options
var control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: false,
    showAlternatives: true,
    altLineOptions: {
        styles: [
            { color: 'black', opacity: 0.15, weight: 9 },
            { color: 'white', opacity: 0.8, weight: 6 },
            { color: 'blue', opacity: 0.5, weight: 2 }
        ]
    }
}).addTo(map);

// When user clicks a different route, update the instructions panel
control.on('routeselected', function(e) {
    var route = e.route;
    var summary = route.summary;
    var instructions = `<strong>${(summary.totalDistance / 1000).toFixed(1)} km, ${(summary.totalTime / 60).toFixed(0)} min</strong><br><ol>`;
    
    route.instructions.forEach(instr => {
        instructions += `<li>${instr.text} - ${instr.distance.toFixed(0)} m</li>`;
    });

    instructions += '</ol>';
    document.getElementById('directions-panel').innerHTML = instructions;
});

function findRoute() {
    var start = document.getElementById("start").value;
    var end = document.getElementById("end").value;

    // Convert start location to coordinates
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${start}`)
        .then(response => response.json())
        .then(startData => {
            if (!startData.length) {
                alert("Start location not found.");
                return;
            }

            // Convert end location to coordinates
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${end}`)
                .then(response => response.json())
                .then(endData => {
                    if (!endData.length) {
                        alert("End location not found.");
                        return;
                    }

                    // Get coordinates
                    var startCoords = [startData[0].lat, startData[0].lon];
                    var endCoords = [endData[0].lat, endData[0].lon];

                    // Set the new waypoints on the control
                    control.setWaypoints([
                        L.latLng(startCoords[0], startCoords[1]),
                        L.latLng(endCoords[0], endCoords[1])
                    ]);
                });
        });
}