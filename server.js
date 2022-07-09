const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const mysql = require('mysql2');
const inputCheck = require('./utils/inputCheck');

//connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Unitas1108!',
        database: 'election'
    },
    console.log('Connected to the election database.')
);
//express middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//queries using the db connection above
//will look for err which should return null
//recalls the rows from the table in the db as requested
//wraps function in get request to /api/candidates
app.get('/api/candidates', (req, res) => {
    //select all values from the candidates table 
    //select property wished to be joined from table 2
    //save wildcard as party_name
    //Join party_name from table 2
    //sets value to the parties.id from table 2
    const sql = `SELECT candidates.*, parties.name
        AS party_name
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }

        res.json({
            message: 'success',
            data: rows
        });
    });
});

//GET single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
        AS party_name
        FROM candidates
        LEFT JOIN parties
        ON candidates.party_id = parties.id
        WHERE candidates.id = ?`;
    //searches uses id value from the request object
    const params = [req.params.id];

    db.query(sql, params, (err, row) => {
        if(err){
            res.status(400).json({error: err.message});
            return;
        }

        res.json({
            message: 'success',
            data: row
        });
    });
});

//Delete a candidate
app.delete('/api/candidate/:id', (req, res) => {
    //define sql command
    const sql = `DELETE FROM candidates WHERE id = ?`;
    //define query params for placeholder
    const params = [req.params.id];

    db.query(sql, params, (err, result) => {
        if(err) {
            res.statusMessage(400).json({error: err.message});
        } else if (!result.affectedRows) {
            //if no affected rows, candidate is incorrect
            res.json({
                message: 'Candidate not found'
            });
        } else {
            //returns success message that the selected candidate was removed
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

//create a candidate
//posts destructured req.body value
// Create a candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
      res.status(400).json({ error: errors });
      return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
  });

//default for request not found
app.use((req, res) => {
    res.status(404).end();
});

//starting server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});