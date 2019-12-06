var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');
var urlencode = require('urlencode');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* Read user's platform requests */
router.get('/', (req, res, next) => {
     var sql_platforms_load = 'SELECT * FROM requests';
     connection.query(sql_platforms_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : "DB Connection Error",
                requests : null
            });
        }
        else {
            res.json({
                result : "success",
                requests : results
            });
        }
     });
});

/* Read platfrom request */
router.get('/:request_id', (req, res, next) => {
    const request_id = req.params.request_id;
    var sql_plaform_load = `SELECT * FROM requests WHERE request_id=${request_id}`;
        connection.query(sql_platforms_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : "DB Connection Error",
                request : null
            });
        }
        else if(results.length == 0) {
            res.json({
                result : "No request matches that id.",
                request : null
            })
        }
        else {
            res.json({
                result : "success",
                request : results[0]
            });
        }
     });
})

/* Cread new platfom request */
router.post('/', (req, res, next) => {
    const user_id = req.body.user_id;
    const request_title = req.body.title;
    const request_content = req.body.content;

    var sql_account_verification = `SELECT * FROM users WHERE id=${user_id}`;
    var sql_request_creation = 'INSERT INTO requests (user_id, title, content) VALUES (?, ?, ?)';

    connection.query(sql_account_verification, (err, results, fields) => {
        if(err){
            res.json({
                result : "DB Connection Error - account",
                request : null
            });
        }
        else if(results.length == 0){
            res.json({
                result : "No account matches that id.",
                request : null
            });
        }
        else{
            connection.query(sql_request_creation, [user_id, request_title, request_content], (err, results, fields) => {
                if(err){
                    res.json({
                        result : "DB Connection Error - post",
                        request : null
                    });
                }
                else{
                    res.json({
                        result : "success",
                        request : {
                            request_id: results.insertId,
                            user_id: user_id,
                            title: request_title,
                            content: request_content
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
