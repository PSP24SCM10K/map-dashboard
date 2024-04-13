const express = require('express');
const cors = require('cors'); // Import cors module
const app = express();
const port = 5001;

// Use cors middleware
app.use(cors());

// Assuming states.js contains your states data
const statesData = require('./states.js');

app.get('/states', (req, res) => {
    // Return the states data as JSON
    res.json(statesData);
});

app.listen(port, () => {
    console.log(`Server is running on port number ${port}`);
});
