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

/* GET videoContents array of user by user_hash */
// 참고 : https://github.com/mysqljs/mysql/issues/1361
router.get('/video/users/:user_id', (req, res, next) => {
    const userId = req.params.user_id;

    getUserSubscriptionInformationByUserId(userId, function (err, rows) {
        if (err) {
            message = "DB has error"
            console.log('Error while performing query.', err);
            res.json({
                result : message,
                videoContents : null
            })
        }
        else {
            json_result = convertObjectToJson(rows);
            
            for(let i = 0; i < json_result.length; i++)
            {
                user_subscriptions_platform_id.push(json_result[i].platform_id);
                user_subscriptions_keyword.push(json_result[i].keyword);
            }
        
            getVideoContentsByPlatformIdAndKeyWord(
                user_subscriptions_platform_id,
                user_subscriptions_keyword,
                function(err, rows){
                    if(err){
                        message = "DB has error"
                        console.log('Error while performing query.', err);
                        res.json({
                            result : message,
                            videoContents: null
                        })
                    }
                    else{
                        message = "success";
                        res.json({
                            result: message,
                            videoContents: rows
                        })
                    }
                }
            )
        }
    });
    
    user_subscriptions = [];                    // Reset user_subscriptions
    user_subscriptions_videoContents = [];       // Reset user_subscriptions_textContents
    user_subscriptions_keyword = [];            // Reset user_subscriptions_keyword
    user_subscriptions_platform_id = [];        // Reset user_subscriptions_platform_id
});


/*-------------------------------------------------------------------------------------------
지금 비디오랑 텍스트가 나뉘어져 있음
근데 서로 가져오는 로직이 같음
단지 타입이 다를뿐
근데 그 타입도 사용하지 않음
왜냐?
비영상 플랫폼과 영상 플랫폼의 platform_id가 다르기 때문임

1. 시간 정렬 기능 아직 안되있음
2. response의 message는 어떤것?????
리팩토링이 된다면 매우 좋을듯.
--------------------------------------------------------------------------------------------*/

module.exports = router;
