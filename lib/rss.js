const html=require('html-entities').encode;

const header=`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">`;

const channel_start=`
<channel>
  <title>freenode Jobs</title>
  <link>https://jobs.freenode.net/</link>
  <description>freenode Jobs is a Job Posting system where you can post LFW (looking for work) or HIRE (hiring) ads</description>`;

const channel_end=`</channel>`;

const footer=`
</rss>`;

function rssTimestampToDate(tm) {
  var a = new Date(tm * 1000);
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var day = days[a.getDay()];
  return day + ", " + month + ' ' + date + ', ' + year;
}

function createRSS(bbs) {
  let output=header+channel_start;
  for(var i=0;i<bbs.length;i++) {
    output+="\n<item>\n<title>"+(bbs[i].TYPE===1?"LFW":"HIRING")+" - "+html(bbs[i].NICK)+"</title>\n<guid>https://jobs.freenode.net/</guid>\n<description>"+bbs[i].MESSAGE+"</description>\n<pubDate>"+rssTimestampToDate(bbs[i].TIMESTAMP)+"</pubDate>\n</item>\n";
  }
  output+=channel_end+footer;
  return output;
}

module.exports = {
  createRSS
}
