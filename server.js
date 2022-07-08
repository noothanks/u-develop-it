const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();
const mysql = require('mysql2');

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
// db.query(`SELECT * FROM candidates`, (err, rows) => {
//     console.log(rows);
// });

//GET single candidate
// db.query(`SELECT * FROM candidates WHERE id = 1`, (err, row) => {
//     if(err) {
//         console.log(err);
//     }
//     console.log(row);
// });

//Delete a candidate
// db.query(`DELETE FROM candidates WHERE id = ?`, 1, (err, result) => {
//     if(err) {
//         console.log(err);
//     }
//     console.log(result);
// });

//create a candidate
const sql = `INSERT INTO candidates (id, first_name, last_name, industry_connected)
            VALUES (?,?,?,?)`;

const params = [1, 'Ronald', 'Firbank', 1];

db.query(sql, params, (err, result) => {
    if (err) {
        console.log(err);
    }
    console.log(result);
});

//default for request not found
app.use((req, res) => {
    res.status(404).end();
});

//starting server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});