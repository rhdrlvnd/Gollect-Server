var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');
var urlencode = require('urlencode');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* Read all requests */
router.get('/', (req, res, next) => {
    var sql_requests_load = 'SELECT * FROM requests';

    connection.query(sql_requests_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : err.code,
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

/* Read specific request by id */
router.get('/:request_id', (req, res, next) => {
    const request_id = req.params.request_id;

    var sql_request_load = `SELECT * FROM requests WHERE request_id=${request_id}`;

    connection.query(sql_request_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : err.code,
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
                result : err.code,
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
                        result : err.code,
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

/* DELETE specific request by id */
router.delete('/:request_id', function(req, res){
    const request_id = req.params.request_id;

    var sql_request_delete = `DELETE FROM requests WHERE request_id=${request_id}`;
    connection.query(sql_request_delete, (err, results, fields) => {
        if(err){
            res.json({
                result : err.code
            });
        }
        else if(results.affectedRows == 0){
            res.json({
                results : "No reqeust matches that id.",
            });
        }
        else{
            res.json({
                result : "success"
            });
        }
    });    
});

module.exports = router;
