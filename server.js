const mongoose = require('mongoose');

const app = require('./app');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {   // Successful connection
        console.log("Connected to MongoDB");
        app.listen(PORT, (err, data) => {   // Start the server
            if (err) {  // Error starting the server
                console.error('Failed to start server:', err);
                process.exitCode = 1;
            } else {    // Server started successfully
                console.log(`Server is listening on ${PORT}`);
            }
        });
    }).catch((error) => {   // Error connecting to MongoDB
        console.error('Failed to connect to MongoDB:', error);
        process.exitCode = 1;
    });
