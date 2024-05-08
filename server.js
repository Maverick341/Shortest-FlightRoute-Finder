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
function calculateShortestPath(source, destination) {
    // Initialize distance array and priority queue
    const distances = {}; // Stores shortest distance to each airport
    const pq = new PriorityQueue(); // Priority queue to store airports based on distance
    const prev = {}; // Stores previous airport in the shortest path

    // Initialize distances to infinity and previous to null
    for (const airport of Object.keys(airports)) {
        distances[airport] = Infinity;
        prev[airport] = null;
    }
    distances[source] = 0;

    // Add source airport to priority queue
    pq.enqueue(source, 0);

    // Dijkstra's algorithm
    while (!pq.isEmpty()) {
        const currentAirport = pq.dequeue().element;

        // If current airport is the destination, stop algorithm
        if (currentAirport === destination) break;

        // Iterate through neighbors of current airport
        for (const neighbor of airports[currentAirport]) {
            const { airport: nextAirport, distance } = neighbor;

            // Calculate new distance
            const newDistance = distances[currentAirport] + distance;

            // If new distance is shorter, update distances and previous
            if (newDistance < distances[nextAirport]) {
                distances[nextAirport] = newDistance;
                prev[nextAirport] = currentAirport;
                pq.enqueue(nextAirport, newDistance);
            }
        }
    }

    // Reconstruct shortest path from source to destination
    const shortestPath = [];
    let current = destination;
    while (current !== null) {
        shortestPath.unshift(current);
        current = prev[current];
    }

    // Return the shortest path and its length
    return { path: shortestPath, length: distances[destination] };
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
    const { source, destination } = req.query;

    // Implement logic to calculate shortest path (not provided in this example)
    const shortestPath = calculateShortestPath(source, destination);

    // Dummy response for demonstration purposes
    // const shortestPath = {
    //     source,
    //     destination,
    //     path: ['Airport A', 'Airport B', 'Airport C'] // Dummy path data
    // };

    res.json(shortestPath);
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
