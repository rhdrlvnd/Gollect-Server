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

/*----------------------------------------------------------------------------
1. Refactoring 필요
2. dbError 함수의 경우 db 에러가 나야 확인할 수 있는데,
에러를 일부러 발생시키는 법을 몰라서 확인 못해봄
----------------------------------------------------------------------------*/

module.exports = router;
