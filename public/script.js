document.addEventListener('DOMContentLoaded', () => {
    const sourceSelect = document.getElementById('source');
    const destinationSelect = document.getElementById('destination');
    const visualizeBtn = document.getElementById('visualize-btn');
    const visualizationContainer = document.getElementById('visualization-container');

    // Fetch airport data from server
    fetch('/airports')
        .then(response => response.json())
        .then(data => {
            // Populate source and destination dropdowns with airport data
            data.forEach(airport => {
                const option = document.createElement('option');
                option.value = airport.IATA;
                option.textContent = `${airport.IATA} - ${airport.AirportName}`;
                sourceSelect.appendChild(option.cloneNode(true));
                destinationSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching airport data:', error));

    // Event listener for visualize button
    visualizeBtn.addEventListener('click', () => {
        const sourceAirport = sourceSelect.value;
        const destinationAirport = destinationSelect.value;

        // Make a request to the server to calculate shortest path
        fetch(`/shortest-path?source=${sourceAirport}&destination=${destinationAirport}`)
            .then(response => response.json())
            .then(shortestPath => {
                // Check if shortestPath exists (handle case of no path found)
                if (shortestPath && shortestPath.path) {
                    visualizationContainer.innerHTML = `
                    <div style="text-align: center;">
                        <p style="font-size: 20px;"><B>Shortest Path: ${shortestPath.path.join(' ➔ ')}</B></p>
                        <p><B>Length: ${shortestPath.length} KM <B></p>
                    </div>
                    `;
                } else {
                    // Display an error message if no path is found (optional)
                    visualizationContainer.innerHTML = '<p>No path found between these airports.</p>';
                }
            })
            .catch(error => console.error('Error fetching shortest path:', error));

    });
});
