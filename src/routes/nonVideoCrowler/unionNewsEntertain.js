const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "https://www.yna.co.kr/entertainment/all"


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
		const $bodyList = $("#content > div.contents > div.contents01 > div.contents-box > div.headlines > ul").children("li.section02");
		
		$bodyList.each(function(i, elem) {
			if(i>10){
				return false;
			}
			let targetUrl = $(this).find('div.con p.poto a').attr('href');
			ulList[i] = {
				id:24,
				title: $(this).find('div.con p.poto img').attr('alt'),
				url: 'https:'+targetUrl,
				img: $(this).find('div.con p.poto img').attr('src'),
				text:$(this).find('div.con p.lead').text().substring(0,30),
				domain_id:8
			};
		});
		
		const data = ulList.filter(n => n.title);
		return data;
	  })
	  .then(res =>{
		res.forEach(function(data,i) {
			getHtml(data.url).then(html=>{
				const $ = cheerio.load(html.data);
				const time = $("#articleWrap > div.article-sns-md.sns-md04 > div.share-info > span > em").text();
				data.time=time;
				return data;
			}).then(res=>{
				let params = [res.id,res.title,res.text, res.url, res.img, res.time,res.domain_id];
			
				let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at,domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
				connection.query(sql, params, (err,rows,fields)=>{
					if(err){
						console.log(err.message);
					}
				});
			});
		})
	})
}

const time=setInterval(crowl,3600*1000);
