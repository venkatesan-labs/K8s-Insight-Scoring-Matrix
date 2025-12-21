const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Enable CORS so your frontend can talk to this backend
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql-service.k8s-insight.svc.cluster.local', // Full K8s DNS
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, 
  database: process.env.MYSQL_DATABASE || 'quiz_results'
});

/**
 * POST: Save user score to database
 */
app.post('/api/score', (req, res) => {
  const { name, company, email, score } = req.body;
  const sql = "INSERT INTO leaderboard (name, company, email, score) VALUES (?, ?, ?, ?)";
  
  db.query(sql, [name, company, email, score], (err) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).send(err);
    }
    res.status(200).send("Saved");
  });
});

/**
 * GET: Retrieve Top 10 users for the leaderboard
 * Since score is "X/Y", we sort by the numeric value of "X"
 */
app.get('/api/leaderboard', (req, res) => {
  // This SQL query extracts the number before the '/' and sorts it numerically DESC
  const sql = `
    SELECT name, score 
    FROM leaderboard 
    ORDER BY CAST(SUBSTRING_INDEX(score, '/', 1) AS UNSIGNED) DESC 
    LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Select Error:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API Running on port ${PORT}`));
