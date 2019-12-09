const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
var RURL = "https://tv.naver.com/musicbank/clips"



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
		const $bodyList = $('div.cds_area').children('div.cds');
		$bodyList.each(function(i, elem) {
			if(i>5){
				return false;
			}
		  ulList[i] = {
			  platform_id:26,
			  title: $(this).find('dt.title').text(),
			  thumbnail_src: $(this).find('img').attr('src'),
			  url: "https://tv.naver.com"+$(this).find('dt.title a').attr('href'),
			  duration: $(this).find('span.tm_b').text(),
			  domain_id:2
		  };
		});
		const data = ulList.filter(n => n.title);
		return data;
	  })
	  .then(res => {
		res.forEach(function(data,i) {
		  getHtml(data.url).then(html=>{
			const $ = cheerio.load(html.data);
			const text = $('span.date').text();    
			let t=[];
			let k=[];
			t=text.split('.');
			k=t[0].split('등록');
			data.uploaded_at=k[1]+'-'+t[1]+'-'+t[2];
			return data;
		  }).then(res=>{
			let params = [res.platform_id,res.title,res.thumbnail_src, res.url, res.duration, res.uploaded_at,res.domain_id]
			let sql = 'INSERT INTO videocontents (platform_id, title, thumbnail_src, url, duration, uploaded_at,domain_id) VALUES(?,?, ?, ?, ?, ?, ?)';
			
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

