const express = require('express');
const router = express.Router();
const db = require('../../db/connection');
const inputCheck = require('../../utils/inputCheck');

//queries using the db connection above
//will look for err which should return null
//recalls the rows from the table in the db as requested
//wraps function in get request to /api/candidates
router.get('/candidates', (req, res) => {
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
router.get('/candidate/:id', (req, res) => {
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

//create a candidate
//posts destructured req.body value
// Create a candidate
router.post('/candidate', ({ body }, res) => {
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

  //update a candidate's party
router.put('/candidate/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `UPDATE candidates SET party_id = ? 
                 WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        // check if a record was found
      } else if (!result.affectedRows) {
        res.json({
          message: 'Candidate not found'
        });
      } else {
        res.json({
          message: 'success',
          data: req.body,
          changes: result.affectedRows
        });
      }
    });
  });

  //Delete a candidate
router.delete('/candidate/:id', (req, res) => {
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

module.exports = router;