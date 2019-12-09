const axios = require("axios");
const cheerio = require("cheerio");
const log = console.log;
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
var RURL = "https://www.youtube.com/channel/UCtt0Hg9MhraTkzWwNQpplHg/videos"

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
	  
	  const $bodyList = $('#channels-browse-content-grid').children('li.channels-content-item');
	  $bodyList.each(function(i, elem) {
		if(i>5){
			return false;
		}
		ulList[i] = {
			platform_id:3,
			title: $(this).find('div.yt-lockup-content a').text(),
			thumbnail_src: $(this).find('img').attr('src'),
			url: "https://www.youtube.com" + $(this).find('div.yt-lockup-content a').attr('href'),
			duration: $(this).find('span.video-time').text(),
			domain_id:1
		};
	  });
	  const data = ulList.filter(n => n.title);
	  return data;
	})
	.then(res => {
	  res.forEach(function(data,i) {
		getHtml(data.url).then(html=>{
		  const $ = cheerio.load(html.data);
		  const text = $('#watch-uploader-info').text();
		  let t=[];
		  t=text.split(': ');
		  return t[1];
		}).then(res => {
			let t=[];
			t= res.split('. ');
			
			data.uploaded_at = t[0]+'-'+t[1]+'-'+t[2];
		  
		  return data;
		}).then(res=>{
		  let params = [res.platform_id,res.title,res.thumbnail_src, res.url, res.duration, res.uploaded_at, res.domain_id]
		  let sql = 'INSERT INTO videocontents (platform_id, title, thumbnail_src, url, duration, uploaded_at, domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
		  
		  connection.query(sql, params, (err,rows,fields)=>{
			  if(err){
				  console.log(err.message);
			  }
			  
		  });
		});
	  });
	});  
}

const time = setInterval(crowl, 3600*1000);
