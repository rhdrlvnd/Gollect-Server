const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig);
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var dbError_text = function(res, err){
    message = err.code
    console.log('Error while performing query.', err);
    res.json({
        result : message,
        textContents: null
    })
}

var dbError_video = function(res, err){
    message = err.code
    console.log('Error while performing query.', err);
    res.json({
        result : message,
        videoContents: null
    })
}

var message;

/* GET bookmark textContents by user_id */
router.get('/users/:user_id/contents/text', (req, res) =>{
    const userId = parseInt(req.params.user_id);

    var textContentId_array = [];
    var textContents_array = [];

    sql_user_check = `SELECT * FROM users WHERE id = ${userId}`
    sql_textContentId_load = `SELECT textcontent_id FROM user_textcontents WHERE user_id=${userId}`;
    sql_textContent_load = `SELECT * FROM textcontents WHERE textContentId = `;

    connection.query(sql_user_check, (err, rows) => {
        if(err){
            dbError_text(res, err)
        }
        else if(rows.length == 0){
            message = "There is no user matches user_id";
            res.json({
                result : message,
                textContents : null
            })
        }
        else{
            connection.query(sql_textContentId_load, (err, rows) => {
                if(err){
                    dbError_text(res, err);
                }
                else if(rows.length == 0){
                    message = "There is no content matches user_id";
                    res.json({
                        result: message,
                        textContents: null
                    })
                }
                else{
                    for(let i = 0; i < rows.length; i++){
                        textContentId_array.push(rows[i].textcontent_id);
        
                        connection.query(sql_textContent_load+textContentId_array[i], (err, rows) => {
                            if(err){
                                dbError_text(res, err)
                            }
                            else{
                                textContents_array.push(rows[0]);
                                if(textContents_array.length == textContentId_array.length){
                                    message = "success";
                                    res.json({
                                        result : message,
                                        textContents: textContents_array
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

/* GET bookmark videoContents by user_id */
router.get('/users/:user_id/contents/video', (req, res) =>{
    const userId = parseInt(req.params.user_id);
    
    var videoContentId_array = [];
    var videoContents_array = [];
    
    sql_user_check = `SELECT * FROM users WHERE id = ${userId}`
    sql_videoContentId_load = `SELECT videocontent_id FROM user_videocontents WHERE user_id=${userId}`;
    sql_videoContent_load = `SELECT * FROM videocontents WHERE videoContentId =`;
    
    connection.query(sql_user_check, (err, rows) => {
        if(err){
            dbError_video(res,err);
        }
        else if(rows.length == 0){
            message = "There is no user matches user_id";
            res.json({
                result : message,
                textContents : null
            })
        }
        else{
            connection.query(sql_videoContentId_load, (err, rows) => {
                if(err){
                    dbError_video(res, err);
                }
                else if(rows.length == 0){
                    message = "There is no content match user_id";
                    res.json({
                        result: message,
                        videoContents: null
                    })
                }
                else{
                    for(let i = 0; i < rows.length; i++){
                        videoContentId_array.push(rows[i].videocontent_id);
                    
                        connection.query(sql_videoContent_load+videoContentId_array[i], (err, rows) => {
                            if(err){
                                dbError_video(res, err)
                            }
                            else{
                                videoContents_array.push(rows[0]);
                                if(videoContents_array.length == videoContentId_array.length){
                                    message = "success";
                                    res.json({
                                        result : message,
                                        videoContents: videoContents_array
                                    })
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})

/* POST bookmark textContents by user_id and textContentId */
router.post('/users/:user_id/contents/text', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const textContentId = req.body.textContentId;

    var params = [userId, textContentId];
    
    sql_user_check = `SELECT * FROM users WHERE id = ${userId}`;
    sql_textBookmark_check = `SELECT * FROM user_textcontents WHERE textcontent_id=${textContentId} AND user_id = ${userId}`
    sql_textBookmark_creation = 'INSERT INTO user_textcontents (user_id, textcontent_id) VALUES (?, ?)'
    sql_textContent_load = `SELECT * FROM textcontents WHERE textContentId=${textContentId}`
    
    connection.query(sql_user_check, (err, rows) => {
        if(err) {
            dbError_text(res, err);
        }
        else if(rows.length == 0){
            message = "There is no user matches user_id";
            res.json({
                message
            })
        }
        else{
            connection.query(sql_textBookmark_check, (err, rows)=> {
                if(err){
                    dbError_text(res,err)
                }
                else if(rows.length > 0){
                    message = "That content already exists."
                    res.json({
                        result: message,
                        textContent: null
                    })
                }
                else{
                    connection.query(sql_textBookmark_creation, params, (err) => {
                        if(err){
                            dbError_text(res, err)
                        }
                        else{
                            message = "success";
                            connection.query(sql_textContent_load, (err, rows)=>{
                                if(err){
                                    dbError_text(res, err);
                                }
                                else{
                                    res.json({
                                        result : message,
                                        textContent: rows
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

/* POST bookmark videoContents by user_id and textContentId */
router.post('/users/:user_id/contents/video', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const videoContentId = req.body.videoContentId;

    var params = [userId, videoContentId];
    
    sql_videoBookmark_check = `SELECT * FROM user_videocontents WHERE videocontent_id=${videoContentId} AND user_id=${userId}`
    sql_videoBookmark_creation = 'INSERT INTO user_videocontents (user_id, videocontent_id) VALUES (?, ?)'
    sql_videoContent_load = `SELECT * FROM videocontents WHERE videoContentId=${videoContentId}`
    
    connection.query(sql_videoBookmark_check, (err, rows)=> {
        if(err){
            dbError_video(res,err)
        }
        else if(rows.length > 0){
            message = "That content already exists."
            res.json({
                result: message,
                videoContent: null
            })
        }
        else{
            connection.query(sql_videoBookmark_creation, params, (err) => {
                if(err){
                    dbError_video(res, err)
                }
                else{
                    message = "success";
                    connection.query(sql_videoContent_load, (err, rows)=>{
                        if(err){
                            dbError_video(res, err);
                        }
                        else{
                            res.json({
                                result : message,
                                videoContent: rows
                            })
                        }
                    })
                }
            })
        }
    })
});

/* DELETE bookmark textContents by user_id and textContentUrl */
router.delete('/users/:user_id/contents/text/:textcontent_id', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const textcontent_id = parseInt(req.params.textcontent_id);

    sql_textBookmark_check = `SELECT * FROM user_textcontents WHERE user_id=${userId} AND textcontent_id=${textcontent_id}`
    sql_textBookmark_remove = `DELETE FROM user_textcontents WHERE user_id=${userId} AND textcontent_id=${textcontent_id}`

    connection.query(sql_textBookmark_check, (err, rows) => {
        if(err){
            dbError_text(res, err)
        }
        else if(rows.length == 0){
            message = "There is no bookmark content matches that id";
            res.json({
                result: message
            })
        }
        else{
            connection.query(sql_textBookmark_remove, (err) => {
                if(err){
                    dbError_text(res, err);
                }
                else{
                    message = "success";
                    res.json({
                        result: message,
                    })
                }
            })
        }
    })
});

/* DELETE bookmark videoContents by user_id and videoContentUrl */
router.delete('/users/:user_id/contents/video/:videocontent_id', (req, res, next) => {
    const userId = parseInt(req.params.user_id);
    const videocontent_id = parseInt(req.params.videocontent_id);

    sql_videoBookmark_check = `SELECT * FROM user_videocontents WHERE user_id=${userId} AND videocontent_id=${videocontent_id}`
    sql_videoBookmark_remove = `DELETE FROM user_videocontents WHERE user_id=${userId} AND videocontent_id=${videocontent_id}`

    connection.query(sql_videoBookmark_check, (err, rows) => {
        if(err){
            dbError_video(res, err)
        }
        else if(rows.length == 0){
            message = "There is no bookmark content matches that id";
            res.json({
                result: message
            })
        }
        else{
            connection.query(sql_videoBookmark_remove, (err) => {
                if(err){
                    dbError_video(res, err);
                }
                else{
                    message = "success";
                    res.json({
                        result: message,
                    })
                }
            })
        }
    })
});

module.exports = router;