# Shortest FlightRoute Finder


***
__To run your project, follow these steps:__

1. _Navigate to Your Project Directory:_ Open a terminal or command prompt and navigate to the directory where your project files are located. For example, if your project is located in G:\S.Y\Sem4\Projects\FlightRoute Explorer, use the cd command to change to that directory:
cd G:\S.Y\Sem4\Projects\FlightRoute Explorer

2. _Install Dependencies:_ If you haven't already done so, install the required dependencies for your project using npm. Run the following command:
__npm install__. This will install all the dependencies listed in your project's package.json file, including Express and sqlite3.

3. _Start the Server:_ Once the dependencies are installed, start your Node.js server by running the server.js file using Node.js. Run the following command:
__node server.js__. This will start your server, and you should see a message indicating that the server is running, along with any log messages or errors from your server code.

4. _Access the Web Page:_ Open a web browser and navigate to http://localhost:<PORT> , replacing <PORT> with the port number your server is running on (usually 3000 by default). For example, if your server is running on port 3000, you would navigate to http://localhost:3000. This will load your index.html page, and you should see the Airport Path Visualization web page with the source and destination dropdowns.

5. _Select Source and Destination:_ Select source and destination airports from the dropdowns and click the "Visualize Shortest Path" button. This should trigger an event that fetches airport data from the server and logs the selected airports to the console.
***
