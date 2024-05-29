const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 3001;

// MySQL connection
const connection = mysql.createConnection({
  host: 'ec2-13-56-238-35.us-west-1.compute.amazonaws.com',
  user: 'judeoc',
  password: 'J0@lmessS',
  database: 'sazstay'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    if (err.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. Check the hostname.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if MySQL server is running and accessible.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check your username and password.');
    }
    return;
  }
  console.log('Connected to MySQL');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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
