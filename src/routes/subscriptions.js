var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');
var urlencode = require('urlencode');


router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());


router.get('/users/:user_id',(req,res,next)=>{
	const userId = req.params.user_id;
	
	var sql = 'SELECT * FROM subscriptions WHERE user_id = ' + userId;

	var result = "";
	connection.query(sql, (err, rows) => {
        if (err) {
			result=err;
			res.json({
				result:result,
				subscriptions:null
			})
		}
        else {
			result = "success";
            res.json({
				result:result,
				subscriptions:rows
			});
        }
    });
});


router.post('/users/:user_id',(req,res,next)=>{
	const userId = req.body.userId;
	const platformId = req.body.platformId;
	const keyword = req.body.keyword;


	var params = [userId, platformId, keyword];

	var sql = 'INSERT INTO subscriptions (user_id, platform_id, keyword) VALUES (?, ?, ?)';

	var result = "";

	connection.query(sql, params, (err, rows, fields) => {
		if(err){
			result=err;
			res.json({
				result:result,
				subscriptions:null
			});
		}
		else{
			result = "success";
			res.json({
				result : result,
				subscriptions: {
					user_id: userId,
    				platform_id: platformId,
    				keyword: keyword
				}
			});
		}
	});
});


router.delete('/users/:user_id/platforms/:platform_id',(req,res)=>{
	const userId = req.params.user_id;
	const platformId = req.params.platform_id;
	const keyword = req.body.keyword;

	var sql = `DELETE FROM subscriptions WHERE user_id = ${userId} and platform_id = ${platformId} and keyword = "${keyword}"`;

	var result = "";

	connection.query(sql, function(err,rows){
        if(err){
			result=err;
			res.json({
				result: result
			});
        }
        else{
			result = "success";
			res.json({
				result : result
			});        
		}
    });
});

router.get('/users/:user_id/platforms/:platform_id',(req,res,next)=>{
	const userId = req.params.user_id;
	const platformId = req.params.platform_id;
	var sql = 'SELECT * FROM subscriptions WHERE user_id = ' + userId;
	sql+=' AND platform_id = '+platformId;

	var result = "";
	connection.query(sql, (err, rows) => {
        if (err) {
			result=err;
			res.json({
				result:result,
				keywords:null
			})
		}
        else {
			result = "success";
            res.json({
				result:result,
				keywords:rows
			});
        }
    });
});


module.exports = router;
