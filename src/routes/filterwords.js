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
		}
	});
});

/* POST users filterword*/
router.post('/users/:user_id', (req, res, next) => {
	const userId = req.params.user_id;
	const filterword = req.body.filterword;

	var params = [userId, filterword];
	console.log(params);

	var sql_filterword_creation = 'INSERT INTO user_filterwords (user_id, filterword) VALUES (?, ?)';

	connection.query(sql_filterword_creation, params, (err, rows, fields) => {
		if(err){
            dbError(res, err);
		}
		else{
			message = "success";
			res.json({
                result : message,
                filterword : filerword
			});
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
