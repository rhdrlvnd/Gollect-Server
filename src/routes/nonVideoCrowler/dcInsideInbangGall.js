const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var dbconfig = require('../../config/database.js');
var connection = mysql.createConnection(dbconfig);
const log = console.log;
var RURL = "https://gall.dcinside.com/board/lists?id=ib_new1&exception_mode=recommend"


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
	  const $bodyList = $("table.gall_list tbody").children("tr");
	  
	  $bodyList.each(function(i, elem) {
		let targetUrl = 'https://gall.dcinside.com'+$(this).find('td.gall_tit a').attr('href');
		ulList[i] = {
			id:15,
			title: $(this).find('td.gall_tit a').text(),
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
			  const $mText = $("div.gallview_contents");
			  const imgSrc = $mText.find('img').attr('src');
			  const text = $mText.text().substring(0,20);
			  const time = $("div.gallview_head span.gall_date").text();
			  return [text,time,imgSrc];
		}).then(res => {
		  data.text = res[0];
		  data.time = res[1];
		  data.img = res[2];
		  return data;
		}).then(res=>{
			  let params = [res.id,res.title,res.text, res.url, res.img, res.time];
			  log(res.id+','+res.title+','+res.text+','+res.url+','+res.img+','+res.time);
			  let sql = 'INSERT INTO textcontents (platform_id, title, abstract, url, img_src, uploaded_at) VALUES(?, ?, ?, ?, ?, ?)';
			  connection.query(sql, params, (err,rows,fields)=>{
			  if(err){
				  console.log(err.message);
			  }
			  else{
				  console.log('success!');
			  }
		  });
	  }).catch(err=>{
		  log("err = " + err)
	  });
  });
  });
  
}


const time = setInterval(crowl,600*1000);