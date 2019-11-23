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

/* GET : Load Account */
router.get('/:user_hash', (req, res, next) => {
	const hash = req.params.user_hash;

	var sql_account_load = 'SELECT * FROM users WHERE hash = \'' + hash + '\'';

	connection.query(sql_account_load, (err, rows, field) => {
		if(err){
            dbError(res, err);
        }
        else if(rows.length === 0){
            message = "No account matches that hash."
            res.json({
                result : message,
                user : null
            })
        }
		else{
            message = "success";

			res.json({
				result : message,
				user :rows
			});
		}
	});
});

/* POST : Account Creation  */
router.post('/', (req, res, next) => {
	const hash = req.body.user_hash;
	const email = req.body.user_email;
	const name = req.body.user_name;

	var params = [hash,email, name];
    
    var sql_account_verification = 'SELECT * FROM users WHERE hash=' + hash;
	var sql_account_creation = 'INSERT INTO users (hash, email, name) VALUES(?, ?, ?)';
    var sql_account_load = 'SELECT * FROM users WHERE hash=' + hash;

    connection.query(sql_account_verification, (err, rows) => {
        if(err){
            dbError(res, err);
        }
        else if(rows.length === 0){
            console.log("In verification ; ", rows)
            connection.query(sql_account_creation, params, (err, rows, fields) => {
                if(err){
                    dbError(res, err);
                }
                else{
                    console.log("In creation ; ", rows)
                    message = "success";
                    connection.query(sql_account_load, (err, rows, fields) => {
                        if(err){
                            dbError();
                        }
                        else{
                            console.log("In load ; ", rows)
                            res.json({
                                result : message,
                                user : rows
                            })
                        }
                    })
                }
            });
        }
        else{
            message = "The Account already exist."
            res.json({
                result : message,
                user: null,
            });
        }
    })
    
});

/* GET : Load user's filterwords */
router.get('/:user_id/filterwords', (req, res, next) => {
	const user_id = req.params.user_id;

	var sql_account_verification = 'SELECT filterword FROM user_filterwords WHERE user_id=' + user_id;

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

/* POST : Create user's filterwords */
router.post('/:user_id/filterwords', (req, res, next) => {
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

/* DELETE : Delete user's filterwords */
router.delete('/:user_id/filterwords/:filterword', (req, res, next) => {
    const user_id = req.params.user_id;
    const filterword = req.params.filterword;
    
	var sql_account_verification = 'SELECT filterword FROM user_filterwords WHERE user_id=' + user_id;
	var sql_filterword_duplicate_check = 'SELECT * FROM user_filterwords WHERE user_id=' + user_id + ' AND filterword="' + filterword + '"';
    var sql_filterword_delete = 'DELETE FROM user_filterwords WHERE user_id=' + user_id + ' AND filterword="' + filterword + '"';

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
                else if(rows.length != 0){
                    connection.query(sql_filterword_delete, params, (err, rows) => {
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
/*----------------------------------------------------------------------------
1. Refactoring 필요
2. dbError 함수의 경우 db 에러가 나야 확인할 수 있는데,
에러를 일부러 발생시키는 법을 몰라서 확인 못해봄
----------------------------------------------------------------------------*/


/* DELETE : Delete user's subscription platform */
router.delete('/:user_id/platforms/:platform_id',(req,res,next)=>{
	var userId=req.params.user_id;
	var platformId = req.params.platform_id;

	var result = "";

	var sql = "DELETE FROM subscriptions WHERE user_id = "+userId;
	sql+=" and platform_id = "+platformId;
	
	connection.query(sql, (err, rows) => {
        if (err) {
			result = err;
			res.json({
				result: result
			});
		}
        else {
			result = "success";

			res.json({
				result: result
			});
        }
    });
});




module.exports = router;
