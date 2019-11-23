var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

var message;

var dbError = function(res, err){
    message = "DB has error"
    console.log('Error while performing query.', err);
    res.json({
        result : message,
        user: null
    })
}

/* GET : Load user's filterwords */
router.get('/users/:user_id', (req, res, next) => {
	const user_id = req.params.user_id;

	var sql_filterwords_load = 'SELECT filterword FROM user_filterwords WHERE user_id=' + user_id;

	connection.query(sql_filterwords_load, (err, rows, fields) => {
		if(err){
            dbError(res, err);
        }
        else if(rows.length === 0){
            message = "No account matches that id."
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
});

/* POST users filterword*/
router.post('/users/:user_id', (req, res, next) => {
	const user_id = req.params.user_id;
	const filterword = req.body.filterword;

    var sql_account_verification = 'SELECT * FROM user_filterwords WHERE user_id=' + user_id;
	var sql_filterword_load = 'SELECT * FROM user_filterwords WHERE user_id=' + user_id + ' AND filterword = "' + filterword + '"';
	var sql_filterword_duplicate_check = 'SELECT * FROM user_filterwords WHERE user_id=' + user_id + ' AND filterword="' + filterword + '"';
	var sql_filterword_creation = 'INSERT INTO user_filterwords (user_id, filterword) VALUES (?, ?)';

    params = [user_id, filterword]
	connection.query(sql_account_verification, (err, rows, fields) => {
		if(err){
            dbError(res, err);
        }
        else if(rows.length === 0){
            message = "No account matches that id."
            res.json({
                result : message,
                filterwords : null
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
router.delete('/:filterword/users/:user_id', function(req, res){
	const userId = req.params.user_id;
	const filterword = req.params.filterword;

	var sql_filterword_delete = 'DELETE FROM user_filterwords WHERE user_id = ';
    sql += userId + ' AND filterword ="';
    sql += filterword + '"';

    console.log("sql: " + sql);

    connection.query(sql_filterword_delete, function(err, result){
        if(err){
            dbError(res, err);
        }
        else{
            message = "success";

            res.json({
                result : message
            })
        }
    })
});

module.exports = router;
