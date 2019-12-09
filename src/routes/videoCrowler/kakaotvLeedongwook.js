const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
var RURL = "https://tv.kakao.com/channel/3431717/video"

const getHtml = async (URL) => {
  try {
    return await axios.get(URL);
  } catch (error) {
    console.error(error);
  }
};

function crowl(){
	getHtml(RURL)
	  .then(html => {
		let ulList = [];
		const $ = cheerio.load(html.data);
		const $bodyList = $('#mArticle ul.list_vertical').children('li');
		$bodyList.each(function(i, elem) {
			if(i>5){
				return false;
			}
			ulList[i] = {
				platform_id:19,
				title: $(this).find('strong.tit_item').text(),
				thumbnail_src: $(this).find('img').attr('src'),
				url: "https://tv.kakao.com"+$(this).find('a').attr('href'),
				duration: $(this).find('span.mark_play').text().split(': ')[1].split('\n')[0]
			}
		});
		const data = ulList.filter(n => n.title);
		return data;
	  })
	  .then(res => {
		res.forEach(function(data,i) {
		  getHtml(data.url).then(html=>{
			const $ = cheerio.load(html.data);
			const text = $('span.create_time').find('span').attr('data-raw-date');
			data.uploaded_at=text;
			data.domain_id=3;
			return data;
		  }).then(res=>{
			// log(res);
			let params = [res.platform_id, res.title, res.thumbnail_src, res.url, res.duration, res.uploaded_at, res.domain_id]
			let sql = 'INSERT INTO videocontents (platform_id, title, thumbnail_src, url, duration, uploaded_at, domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
			
			connection.query(sql, params, (err,rows,fields)=>{
			  if(err){
				console.log(err.message);
			  }
			});
		  });
		})
	  });
}

const time = setInterval(crowl,3600*1000);