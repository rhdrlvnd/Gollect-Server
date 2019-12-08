var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');
var urlencode = require('urlencode');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* Read all notices */
router.get('/', (req, res, next) => {
    var sql_notices_load = 'SELECT * FROM notices';

    connection.query(sql_notices_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : err.code,
                notices : null
            });
        }
        else {
            res.json({
                result : "success",
                notices : results
            });
        }
    });
});

/* Read specific notice by id */
router.get('/:notice_id', (req, res, next) => {
    const notice_id = req.params.notice_id;

    var sql_notice_load = `SELECT * FROM notices WHERE notice_id=${notice_id}`;

    connection.query(sql_notice_load, (err, results, fields) => {
        if(err) {
            res.json({
                result : err.code,
                notice : null
            });
        }
        else if(results.length == 0) {
            res.json({
                result : "No notice matches that id.",
                notice : null
            })
        }
        else {
            res.json({
                result : "success",
                notice : results[0]
            });
        }
     });
})

/* Create new notice */
router.post('/', (req, res, next) => {
    const notice_title = req.body.title;
    const notice_content = req.body.content;

    var sql_notice_creation = 'INSERT INTO notices (title, content) VALUES (?, ?)';

    connection.query(sql_notice_creation, [notice_title, notice_content], (err, results, fields) => {
        if(err){
            res.json({
                result : err.code,
                notice : null
            });
        }
        else{
            res.json({
                result : "success",
                notice : {
                    notice_id: results.insertId,
                    title: notice_title,
                    content: notice_content
                }
            });
        }
    });        
});

/* DELETE speicific notice by id */
router.delete('/:notice_id', function(req, res){
    const notice_id = req.params.notice_id;

    var sql_notice_delete = `DELETE FROM notices WHERE notice_id=${notice_id}`;
    connection.query(sql_notice_delete, (err, results, fields) => {
        if(err){
            res.json({
                result : err.code
            });
        }
        else if(results.affectedRows == 0){
            res.json({
                results : "No notice matches that id.",
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
