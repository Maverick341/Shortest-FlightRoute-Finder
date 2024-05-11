const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

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
function calculateShortestPath(SourceIATA, NeighborIATA, airports) {
    // Initialize Distance array and priority queue
    const Distances = {}; // Stores shortest Distance to each airport
    const pq = new PriorityQueue(); // Priority queue to store airports based on Distance
    const prev = {}; // Stores previous airport in the shortest path

    // Initialize Distances to infinity and previous to null
    for (const airport of Object.keys(airports)) {
        Distances[airport] = Infinity;
        prev[airport] = null;
    }
    Distances[SourceIATA] = 0;

    // Add SourceIATA airport to priority queue
    pq.enqueue(SourceIATA, 0);

    // Dijkstra's algorithm
    while (!pq.isEmpty()) {
        const currentAirport = pq.dequeue().element;

        // If current airport is the NeighborIATA, stop algorithm
        if (currentAirport === NeighborIATA) break;

        // Iterate through neighbors of current airport
        for (const neighbor of airports[currentAirport]) {
            const { airport: nextAirport, Distance } = neighbor;

            // Calculate new Distance
            const newDistance = Distances[currentAirport] + Distance;

            // If new Distance is shorter, update Distances and previous
            if (newDistance < Distances[nextAirport]) {
                Distances[nextAirport] = newDistance;
                prev[nextAirport] = currentAirport;
                pq.enqueue(nextAirport, newDistance);
            }
        }
    }

    // Reconstruct shortest path from SourceIATA to NeighborIATA
    const shortestPath = [];
    let current = NeighborIATA;
    while (current !== null) {
        shortestPath.unshift(current);
        current = prev[current];
    }

    // Return the shortest path and its length
    return { path: shortestPath, length: Distances[NeighborIATA] };
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

// Define API endpoint to retrieve list of airports
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

// Define API endpoint to calculate shortest path between airports
app.get('/shortest-path', (req, res) => {
    const { SourceIATA, NeighborIATA } = req.query;

    // Ensure SourceIATA and NeighborIATA airports are provided
    if (!SourceIATA || !NeighborIATA) {
        return res.status(400).json({ error: 'SourceIATA and NeighborIATA airports are required' });
    }

    // Check if SourceIATA and NeighborIATA airports exist in the database
    db.all('SELECT * FROM Neighbors', (err, rows) => {
        if (err) {
            console.error('Error querying neighbor data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Initialize the airports object
        const airports = {};

        // Process the rows to populate the airports object
        rows.forEach(row => {
            const sourceAirport = row.SourceIATA;
            const neighborAirport = row.NeighborIATA;
            const distance = row.Distance;

            // Check if the source airport exists in the airports object, if not, initialize it
            if (!airports[sourceAirport]) {
                airports[sourceAirport] = [];
            }

            // Add the neighbor and distance to the source airport's array of neighbors
            airports[sourceAirport].push({ airport: neighborAirport, distance: distance });
        });

        // Now, you can use the populated airports object for Dijkstra's algorithm
        const shortestPath = calculateShortestPath(sourceAirport, destinationAirport, airports);

        // Send the calculated shortest path in the response
        if (shortestPath) {
            return res.json(shortestPath);
        } else {
            // Handle case where no path is found (optional)
            return res.status(404).json({ error: 'No path found between these airports' });
        }
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
