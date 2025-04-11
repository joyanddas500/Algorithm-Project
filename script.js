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
const graph = {
    A: { B: 1, C: 4 },
    B: { A: 1, C: 2, D: 5 },
    C: { A: 4, B: 2, D: 1 },
    D: { B: 5, C: 1 }
};

const coords = {
    A: [23.8103, 90.4125],
    B: [23.8200, 90.4300],
    C: [23.8000, 90.4200],
    D: [23.7900, 90.4000]
};

function dijkstra(start, end, graph) {
    let distances = {};
    let prev = {};
    let pq = [];

    for (let node in graph) {
        distances[node] = Infinity;
        prev[node] = null;
        pq.push(node);
    }
    distances[start] = 0;

    while (pq.length > 0) {
        pq.sort((a, b) => distances[a] - distances[b]);
        let current = pq.shift();

        if (current === end) break;

        for (let neighbor in graph[current]) {
            let alt = distances[current] + graph[current][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = current;
            }
        }
    }

    let path = [];
    for (let at = end; at != null; at = prev[at]) {
        path.push(at);
    }
    return path.reverse();
}

function drawPath(path) {
    const latlngs = path.map(p => coords[p]);
    L.polyline(latlngs, { color: 'red' }).addTo(map);
}
