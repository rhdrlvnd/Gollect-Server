var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/', (req,res,next)=>{
	
	var result = "";

	connection.query('SELECT * FROM platforms', function(err, rows){
		if(err){
			result = err;
			res.json({
				result: result,
				platforms: null
			})
		}
		else{
			result = "success";

			res.json({
				result: result,
				platforms: rows
			});

		}
	})
});

router.get('/:platform_id',(req,res,next)=>{
	var platform_id=req.params.platform_id;
	var sql = 'SELECT * FROM platforms WHERE id ='+platform_id;

	var result = "";
	connection.query(sql, (err, rows) => {
        if (err) {
			result = err;
			res.json({
				result: result,
				platforms: null
			});
		}
        else {
			result = "success";

			res.json({
				result: result,
				platforms: rows
			});
        }
    });
})

module.exports = router;
