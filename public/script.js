document.addEventListener('DOMContentLoaded', () => {
    const sourceSelect = document.getElementById('source');
    const destinationSelect = document.getElementById('destination');
    const visualizeBtn = document.getElementById('visualize-btn');

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

        console.log('Source Airport:', sourceAirport);
        console.log('Destination Airport:', destinationAirport);
    });
});
