const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// PriorityQueue class for Dijkstra's algorithm
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(queueElement);
        }
    }

    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Function to calculate shortest path using Dijkstra's algorithm
function calculateShortestPath(source, destination, airports) {
    const Distances = {}; // Stores shortest Distance to each airport
    const pq = new PriorityQueue(); // Priority queue to store airports based on Distance
    const prev = {}; // Stores previous airport in the shortest path

    for (const airport of Object.keys(airports)) {
        Distances[airport] = Infinity;
        prev[airport] = null;
    }
    Distances[source] = 0;
    pq.enqueue(source, 0);

    while (!pq.isEmpty()) {
        const currentAirport = pq.dequeue().element;
        if (currentAirport === destination) break;

        for (const neighbor of airports[currentAirport]) {
            const { airport: nextAirport, distance } = neighbor;
            const newDistance = Distances[currentAirport] + distance;

            if (newDistance < Distances[nextAirport]) {
                Distances[nextAirport] = newDistance;
                prev[nextAirport] = currentAirport;
                pq.enqueue(nextAirport, newDistance);
            }
        }
    }

    const shortestPath = [];
    let current = destination;
    while (current !== null) {
        shortestPath.unshift(current);
        current = prev[current];
    }

    return { path: shortestPath, length: Distances[destination] };
}

// SQLite database connection
const db = new sqlite3.Database('airports.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
        return;
    }
    console.log('Connected to SQLite database');
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route handler for the root URL ("/")
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API endpoint to retrieve list of airports
app.get('/airports', (req, res) => {
    db.all('SELECT * FROM Airports', (err, rows) => {
        if (err) {
            console.error('Error querying airports:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// API endpoint to calculate shortest path between airports
app.get('/shortest-path', (req, res) => {
    const { source, destination } = req.query;

    if (!source || !destination) {
        return res.status(400).json({ error: 'Source and destination airports are required' });
    }

    db.all('SELECT * FROM Neighbors', (err, rows) => {
        if (err) {
            console.error('Error querying neighbor data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        console.log("Rows ",rows)

        const airports = {};

        rows.forEach(row => {
            const sourceAirport = row.SourceIATA;
            const neighborAirport = row.NeighborIATA;
            const distance = row.Distance;

            if (!airports[sourceAirport]) {
                airports[sourceAirport] = [];
            }

            airports[sourceAirport].push({ airport: neighborAirport, distance: distance });
        });

        const shortestPath = calculateShortestPath(source, destination, airports);

        console.log("Shortest Path: ", shortestPath)

        if (shortestPath.path.length > 0) {
            return res.json(shortestPath);
        } else {
            return res.status(404).json({ error: 'No path found between these airports' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
