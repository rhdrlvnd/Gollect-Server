const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "https://gall.dcinside.com/board/lists?id=football_new6&exception_mode=recommend"

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
	  const $bodyList = $("table.gall_list tbody").children("tr.us-post");
	  
	  $bodyList.each(function(i, elem) {
		if(i>10){
			return false;
		}
		let targetUrl = 'https://gall.dcinside.com'+$(this).find('td.gall_tit a').attr('href');
		ulList[i] = {
			id:15,
			title: $(this).find('td.gall_tit a').text(),
			url: targetUrl,
			domain_id:4
		};
	  });
	  const data = ulList.filter(n => n.title);
	  return data;
	})
	.then(res =>{
	  res.forEach(function(data,i) {
		  getHtml(data.url).then(html=>{
			  const $ = cheerio.load(html.data);
			  const $mText = $("div.writing_view_box");
			  const imgSrc = $mText.find('img').attr('src');
			  const text = $mText.text().substring(0,20).replace(/^\s*/,"");
			  const time = $("div.gallview_head span.gall_date").text();
			  return [text,time,imgSrc];
		}).then(res => {
		  data.text = res[0];
		  data.time = res[1];
		  data.img = res[2];
		  return data;
		}).then(res=>{
				let params = [res.id,res.title,res.text, res.url, res.img, res.time, res.domain_id];
				let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at, domain_id) VALUES(?, ?, ?, ?, ?, ?, ?)';
				connection.query(sql, params, (err,rows,fields)=>{
					if(err){
						console.log(err.message);
					}
				});
			}).catch(err=>{
				log(err.code)
			});
		});
	})
}

const time = setInterval(crowl,3600*1000);
