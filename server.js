const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// MySQL connection
const connection = mysql.createConnection({
  host: 'sql104.infinityfree.com',
  user: 'if0_36634095',
  password: '0nhgUtOF9BkB',
  database: 'if0_36634095_home_db'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to get the latest properties or search results
app.post('/api/properties', (req, res) => {
  const { location, type, offer, bhk, min, max, status, furnished } = req.body;
  
  let query = "SELECT * FROM property";
  let queryParams = [];
  
  if (location || type || offer || bhk || min || max || status || furnished) {
    query += " WHERE";
    const conditions = [];
    
    if (location) {
      conditions.push(" address LIKE ?");
      queryParams.push(`%${location}%`);
    }
    if (type) {
      conditions.push(" type LIKE ?");
      queryParams.push(`%${type}%`);
    }
    if (offer) {
      conditions.push(" offer LIKE ?");
      queryParams.push(`%${offer}%`);
    }
    if (bhk) {
      conditions.push(" bhk LIKE ?");
      queryParams.push(`%${bhk}%`);
    }
    if (status) {
      conditions.push(" status LIKE ?");
      queryParams.push(`%${status}%`);
    }
    if (furnished) {
      conditions.push(" furnished LIKE ?");
      queryParams.push(`%${furnished}%`);
    }
    if (min && max) {
      conditions.push(" price BETWEEN ? AND ?");
      queryParams.push(min, max);
    }
    
    query += conditions.join(" AND");
  }
  
  query += " ORDER BY date DESC";
  
  connection.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Example route to get users
app.get('/api/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
