var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');
// var urlencode = require('urlencode');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

var message;

var dbError = function(res, err){
    message = err.code
    console.log('Error while performing query.', err);
    res.json({
        result : message,
        filterwords: null
    })
}

/* GET : Load user's filterwords */
router.get('/users/:user_id', (req, res, next) => {
	const user_id = req.params.user_id;

	var sql_user_check = `SELECT * FROM users WHERE id=${user_id}`;
	var sql_filterwords_load = 'SELECT filterword FROM user_filterwords WHERE user_id=' + user_id;

    connection.query(sql_user_check, (err, rows) => {
        if(err){
            dbError(res, err);
        }
        else if(rows.length == 0){
            message = "There is no user matches that user_id";
            res.json({
                result : message,
                filterwords: null
            })
        }
        else{
            connection.query(sql_filterwords_load, (err, rows, fields) => {
                if(err){
                    dbError(res, err);
                }
                else if(rows.length === 0){
                    message = "No filterwords match that id."
                    res.json({
                        result : message,
                        filterwords : null
                    })
                }
                else{
                    message = "success"
                    var filterwords = [];
                    for(let i = 0; i < rows.length; i++){
                        filterwords.push(rows[i].filterword);
                    }
                    res.json({
                        result : message,
                        filterwords : filterwords
                    });
                }
            });
        }
    })
});

/* POST users filterword*/
router.post('/users/:user_id', (req, res, next) => {
	const user_id = req.params.user_id;
	const filterword = req.body.filterword;

    var sql_account_verification = `SELECT * FROM users WHERE id=${user_id}`;
	var sql_filterword_load = `SELECT * FROM user_filterwords WHERE user_id= ${user_id} AND filterword = "${filterword}"`;
	var sql_filterword_duplicate_check = 'SELECT * FROM user_filterwords WHERE user_id=' + user_id + ' AND filterword="' + filterword + '"';
	var sql_filterword_creation = 'INSERT INTO user_filterwords (user_id, filterword) VALUES (?, ?)';

    params = [user_id, filterword]
	connection.query(sql_account_verification, (err, rows, fields) => {
		if(err){
            message = err.code;
            res.json({
                result : message,
                filter : null
            })
        }
        else if(rows.length === 0){
            message = "No account matches that id."
            res.json({
                result : message,
                filter : null
            })
        }
		else{
            connection.query(sql_filterword_duplicate_check, (err, rows, fields) => {
                if(err){
                    dbError(res, err);
                }
                else if(rows.length === 0){
                    connection.query(sql_filterword_creation, params, (err, rows) => {
                        if(err){
                            dbError();
                        }
                        else{
                            message = "success"
                            connection.query(sql_filterword_load, (err, rows) => {
                                if(err) dbError();
                                else {
                                    res.json({
                                        result : message,
                                        filter : rows[0]
                                    })
                                }
                            })
                        }
                    })
                }
                else{
                    message = "The Filterword already exists.";
                    res.json({
                        result : message,
                        filter : null
                    })
                }
            })
		}
	});
});

/* DELETE users filterword*/
router.delete('/users/:user_id', function(req, res){
    // const filterword = urlencode.decode(req.params.filterword);
    const filterword = req.body.filterword;
    const user_id = req.params.user_id;
    
	var sql_account_verification = `SELECT filterword FROM user_filterwords WHERE user_id=${user_id}`;
	var sql_filterword_duplicate_check = `SELECT * FROM user_filterwords WHERE user_id=${user_id} AND filterword='${filterword}'`;
    var sql_filterword_delete = `DELETE FROM user_filterwords WHERE user_id=${user_id} AND filterword='${filterword}'`;

	connection.query(sql_account_verification, (err, rows, fields) => {
		if(err){
            dbError(res, err);
        }
        else if(rows.length == 0){
            message = "No account matches that id."
            res.json({
                result : message,
            })
        }
		else{
            connection.query(sql_filterword_duplicate_check, (err, rows, fields) => {
                if(err){
                    dbError(res, err);
                }
                else if(rows.length != 0){
                    connection.query(sql_filterword_delete, (err, rows) => {
                        if(err){
                            dbError();
                        }
                        else{
                            message = "success"
                            res.json({
                                result : message
                            })
                        }
                    })
                }
                else{
                    message = "There is no such filterword in  the user's filterwords.";
                    res.json({
                        result : message
                    })
                }
            })
		}
	});
});

module.exports = router;
