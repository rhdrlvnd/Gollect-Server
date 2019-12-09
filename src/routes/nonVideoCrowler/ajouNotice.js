const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "http://www.ajou.ac.kr/main/ajou/notice.jsp"


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
		const $bodyList = $("div.list_wrap tbody").children("tr");
		
		$bodyList.each(function(i, elem) {
			if(i>10){
				return false;
			}
			let targetUrl = 'http://www.ajou.ac.kr/main/ajou/notice.jsp'+$(this).find('td.title_comm a').attr('href');
			ulList[i] = {
				id:21,
				title: $(this).find('td.title_comm a').text().split('\n  \t    \t')[1],
				url: targetUrl
			};
		});
		const data = ulList.filter(n => n.title);
		return data;
	  })
	  .then(res =>{
		
		res.forEach(function(data,i) {
	
		  getHtml(data.url).then(html=>{
			const $ = cheerio.load(html.data);
			const $mText = $("#article_text");
			data.img = 'http://www.ajou.ac.kr/'+$mText.find('img').attr('src');
			data.text = $mText.text().trim().substring(0,15);
			data.time = $('#jwxe_main_content > div > div.view_wrap.ko > table > tbody > tr:nth-child(2) > td:nth-child(4)').text();
			data.domain_id=6;
			return data;
		  }).then(res=>{

				let params = [res.id,res.title,res.text, res.url, res.img, res.time,res.domain_id];
				
				let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at,domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
				connection.query(sql, params, (err,rows,fields)=>{
					if(err){
						console.log(err.message);
					}
				});
			}).catch(err=>{
				log(err.code)
	  		});
		});
	});	
}

const time=setInterval(crowl,3600*1000);
