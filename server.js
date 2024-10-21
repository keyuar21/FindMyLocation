import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import axios from 'axios';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Resolve the path correctly using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (e.g., CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Route to render the form (GET request)
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Route to handle form submission (POST request)
app.post('/location', async (req, res) => {
  const lat = req.body.latitude;
  const lng = req.body.longitude;

  // Validate latitude and longitude
  if (!lat || !lng) {
    return res.send('Please provide both latitude and longitude.');
  }

  try {
    // Use axios to call the Nominatim API
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const results = response.data;

    if (results) {
      const city = results.address.city || results.address.town || results.address.village || 'Unknown';
      const area = results.address.neighbourhood || results.address.suburb || 'Unknown';
      const road = results.address.road || 'Unknown';
      const postalCode = results.address.postcode || 'Unknown';

      // Render the location.ejs file and pass the location data
      res.render('location.ejs', { lat, lng, city, area ,road , postalCode});
    } else {
      res.send('No results found.');
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.send('Error fetching location data. Please try again later.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
