const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var dbError = function(res, err){
    message = "DB has error"
    console.log('Error while performing query.', err);
    res.json({
        result : message,
        user: null
    })
}

var message;

/* POST bookmark textContents by user_id and textContentUrl */
router.post('/users/:user_id/contents/text', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const textContentUrl = req.body.textContentUrl;

    var params = [userId, textContentUrl];

    sql_bookmark_creation = 'INSERT INTO user_textcontents (user_id, textcontent_url) VALUES (?, ?)'
    // res에 textContent를 반환하기 위한 query문
    sql_textContent_load = `SELECT * FROM textcontents WHERE url="${textContentUrl}"`
    
    connection.query(sql_bookmark_creation, params, (err, rows) => {
        if(err){
            dbError(res, err);
        }
        else{
            connection.query(sql_textContent_load, (err, rows)=>{
                if(err){
                    dbError(res,err);
                }
                else{
                    message = "success";
                    res.json({
                        result: message,
                        textContent: rows
                    })
                }
            })
        }
    })

});

/* POST bookmark videoContents by user_id and textContentUrl */
router.post('/users/:user_id/contents/video', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const videoContentUrl = req.body.videoContentUrl;

    var params = [userId, videoContentUrl];

    sql_bookmark_creation = 'INSERT INTO user_videocontents (user_id, videocontent_url) VALUES (?, ?)'
    // res에 textContent를 반환하기 위한 query문
    sql_videoContent_load = `SELECT * FROM videocontents WHERE url="${videoContentUrl}"`

    connection.query(sql_bookmark_creation, params, (err, rows) => {
        if(err){
            dbError(res, err);
        }
        else{
            connection.query(sql_videoContent_load, (err, rows)=>{
                if(err){
                    dbError(res,err);
                }
                else{
                    message = "success";
                    res.json({
                        result: message,
                        videoContent: rows
                    })
                }
            })
        }
    })
});

/* DELETE bookmark textContents by user_id and textContentUrl */
router.delete('/users/:user_id/contents/text', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const textContentUrl = req.body.textContentUrl;
    console.log(textContentUrl)
    sql_bookmark_remove = `DELETE FROM user_textcontents WHERE user_id=${userId} AND textcontent_url="${textContentUrl}"`
    console.log(sql_bookmark_remove)
    connection.query(sql_bookmark_remove, (err) => {
        if(err){
            dbError(res, err);
        }
        else{
            message = "success";
            res.json({
                result: message,
            })
        }
    })
});

/* DELETE bookmark videoContents by user_id and videoContentUrl */
router.delete('/users/:user_id/contents/video', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const videoContentUrl = req.body.videoContentUrl;
    sql_bookmark_remove = `DELETE FROM user_videocontents WHERE user_id=${userId} AND videocontent_url="${videoContentUrl}"`
    connection.query(sql_bookmark_remove, (err) => {
        if(err){
            dbError(res, err);
        }
        else{
            message = "success";
            res.json({
                result: message,
            })
        }
    })
});



module.exports = router;