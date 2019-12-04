const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);

const log = console.log;
var RURL = "http://www.inven.co.kr/board/hs/3560"


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
	  const $bodyList = $("#powerbbsBody tbody tr.ls").children("td.bbsSubject");
	  
	  $bodyList.each(function(i, elem) {
		let targetUrl = $(this).find('a.sj_ln').attr('href');
		ulList[i] = {
			id:14,
			title: $(this).find('a.sj_ln').text(),
			url: targetUrl,
		};
	  });
	  const data = ulList.filter(n => n.title);
	  return data;
	})
	.then(res =>{
	  let daList = [];
	  res.forEach(function(data,i) {
  
		getHtml(data.url).then(html=>{
		  
		  const $ = cheerio.load(html.data);
		  const $mText = $("#powerbbsContent");
		  const imgSrc = $mText.find('img').attr('src');
		  
		  const time = $("#tbArticle div.articleDate").text();
		  const text = $mText.text().substring(0,20);
  
		  return [text,time,imgSrc];
		}).then(res => {
		  data.text = res[0];
		  data.time = res[1];
		  data.img = res[2];
		  daList[i]=data;
		  return data;
		}).then(res=>{
		  log("여기는 .then..")
		  let params = [res.id,res.title,res.text, res.url, res.img, res.time]
		  //log(res.id+','+res.title+','+res.text+','+res.url+','+res.img+','+res.time);
		  let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at) VALUES(?, ?, ?, ?, ?, ?)';
		  log("sql = "+sql);
		  
		  connection.query(sql, params, (err,rows,fields)=>{
			  if(err){
				  console.log(err.message);
			  }
			  else{
				  console.log('success!');
			  }
		  });
  
		  });
	  });
  
  });
}

const time = setInterval(crowl,600*1000);