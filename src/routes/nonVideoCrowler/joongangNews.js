const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "https://news.joins.com/politics?cloc=joongang-section-gnb2"


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
		const $bodyList = $("#content ul.type_b").children("li");
		
		$bodyList.each(function(i, elem) {
		  let targetUrl = $(this).find('span.thumb a').attr('href');
		  let t=[];
		  t=$(this).find('span.byline').text().split('.');
		  ulList[i] = {
			  id:22,
			  title: $(this).find('span.thumb img').attr('alt'),
			  url: targetUrl,
			  img: $(this).find('span.thumb img').attr('src'),
			  text:$(this).find('span.lead a').text().substring(0,30),
			  time:t[0]+'-'+t[1]+'-'+t[2],
			  domain_id:7
		  };
		//   console.log(ulList[i]);
		});
		const data = ulList.filter(n => n.title);
		return data;
	  })
	  .then(res =>{
		//   log(res);
		res.forEach(function(data,i){
			let params = [data.id, data.title, data.text, data.url, data.img, data.time, data.domain_id];
			
			let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at, domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
			connection.query(sql, params, (err,rows,fields)=>{
				if(err){
					console.log(err.message);
				}
				else{
					console.log('success!');
				}
			});



		})
		
	
	});
}

const time = setInterval(crowl,3600*1000);
