const fs = require('fs');
const striptags = require('striptags');
const timeago = require('timeago.js');

const rss = require('./lib/rss.js'); // rss feed
const Help = require('./lib/help.js');  // help text
const constants = require('./lib/constants.js');  // constants and settings
const IRC = new (require('./lib/irc.js')).IRC();  // irc client, connected
const Database = new (require('./lib/db.js')).Database();  // database, connected

// Hack
// TODO: Better way to ensure one instance of bot only (pid file method breaks if process exits unexpectedly)
var app = require('express')();
app.listen(22535);


// Main listener
IRC.addListener('raw',async (message) => {
  console.log(message);
  if(message.command==='PRIVMSG' &&
    (message.args[0].toLowerCase()==='@'+constants.IRC_CHAN.toLowerCase() || message.args[0].toLowerCase()===constants.IRC_CHAN.toLowerCase())) {
    if(await Database.userIsRegistered(message.nick))
      parse(message.nick,message.args[1],(message.args[0].substr(0,1)=='#'));
  }
  else if(message.command==='JOIN') {
    if(!await Database.userIsRegistered(message.nick))
      IRC.whois(message.nick);
    else
      IRC.notice(message.nick,"Welcome back!");
  }
  else if(message.command==='330') {
    if(message.args[1].toLowerCase()!==message.args[2].toLowerCase()) {
      IRC.mode(constants.IRC_CHAN,'+b',message.args[1]+"!*@*");
      IRC.remove(constants.IRC_CHAN,message.args[1],"Sorry, but only primary nicks may join this channel.");
      setTimeout(() => {
        IRC.mode(constants.IRC_CHAN,'-b',message.args[1]+"!*@*");
      },10000);
    }
    else {
      if(await Database.userRegister(message.args[2]))
        IRC.notice(message.args[2],"You have been added to the verified user database.");
    }
  }
});

// Main bot processor
async function parse(from,msg,isop) {
  msg=msg.split(" ");
  switch(msg[0].toLowerCase()) {
    case "help":
      if(!msg[1])
        IRC.notice_chan(from,Help.help,constants.IRC_CHAN);
      else {
        IRC.notice_chan(from,Help.header,constants.IRC_CHAN);
        switch(msg[1].toLowerCase()) {
          case 'lfw':
            IRC.notice_chan(from,Help.lfw,constants.IRC_CHAN);
            break;
          case 'hire':
            IRC.notice_chan(from,Help.hire,constants.IRC_CHAN);
            break;
          case 'del':
            IRC.notice_chan(from,Help.del,constants.IRC_CHAN);
            break;
          default:
            IRC.notice_chan(from,Help.none+msg[1]);
            break;
        }
        IRC.notice_chan(from,Help.footer,constants.IRC_CHAN);
      }
      break;
    case 'lfw':
    case 'hire':
      let type = msg[0].toLowerCase()=='lfw'?1:2; // lfw = 1, hire = 2
      let typealpha = msg[0].toUpperCase();
      msg.shift();
      let fullmsg = msg.join(" ");
      if(!await Database.userCanPost(from))
        IRC.notice_chan(from,"Sorry, you can only have one post at a time",constants.IRC_CHAN);
      else if(msg.length<2)
        IRC.notice_chan(from,"Syntax error.  Try 'help'",constants.IRC_CHAN);
      else if(striptags(fullmsg)!==fullmsg)
        IRC.notice_chan(from,"Sorry, but these characters are not allowed in a post.",constants.IRC_CHAN);
      else {
        if(fullmsg.length<constants.POST_MIN_LENGTH) {
          IRC.notice_chan(from,"Post must be > "+constants.POST_MIN_LENGTH+" chars",constants.IRC_CHAN);
        }
        else if(fullmsg.replace(/[^a-zA-Z0-9\,\-\.\'\"\?\!\%\$\#\@\(\)\*\+\~\\\/\:\;\[\]\{\}\= ]/g,"")!==fullmsg)
          IRC.notice_chan(from,"Sorry, but these characters are not allowed in a title.",constants.IRC_CHAN);
        else {
          result = await Database.post(from,fullmsg,type);
          if(result) {
            IRC.say(constants.IRC_CHAN,constants.BOLD+'['+typealpha+'] ['+result+'] '+IRC.colour.red(fullmsg)+' '+IRC.colour.grey('['+from+']')+constants.BOLD);
            updateAll();
          }
          else
            IRC.notice_chan(from,"An unknown error has occurred.",constants.IRC_CHAN);
        }
      }
      break;
    case 'del':
      if(msg.length < 2)
        IRC.notice_chan(from,"Syntax error.  Try 'help'",constants.IRC_CHAN);
      else {
        result = await Database.findPost(msg[1]);
        if(!result)
          IRC.notice_chan(from,"That post does not exist.",constants.IRC_CHAN);
        else if(result.NICK.toLowerCase()===from.toLowerCase() || isop) {
          await Database.delPost(msg[1]);
          IRC.notice_chan(from,"Post has been deleted.",constants.IRC_CHAN);
          IRC.say(constants.IRC_CHAN,"Post ["+msg[1]+"] has been deleted"+(isop?".":" by the original poster."));
          updateAll();
        }
        else {
          IRC.notice_chan(from,"You do not have permission to delete that post.",constants.IRC_CHAN);
        }
      }
      break;
    default:
      break;
  }
};




setInterval(async () => {
  await updateAll()
  let expired = await Database.getExpired();
  for(x=0;x<expired.length;x++) {
    await Database.setExpired(expired[x].PID);
  }
},60000);


async function updateAll() {
  let out_all="";
  let out_lfw="";
  let out_hire="";
  let all = await Database.getFrontpage();
  let lfw = await Database.getFrontpage(1);
  let hire = await Database.getFrontpage(2);

  for(x=0;x<all.length;x++) {
    out_all+="<tr><td class='type'>"+(all[x].TYPE===1?"LFW":"HIRING")+"</td><td class='post'>"+striptags(all[x].MESSAGE)+"<br><small>Submitted by <u>"+all[x].NICK+"</u> about "+timeago.format(all[x].TIMESTAMP*1000)+"</small></td></tr>";
  }
  for(x=0;x<lfw.length;x++) {
    out_lfw+="<tr><td class='type'>"+(lfw[x].TYPE===1?"LFW":"HIRING")+"</td><td class='post'>"+striptags(lfw[x].MESSAGE)+"<br><small>Submitted by <u>"+lfw[x].NICK+"</u> about "+timeago.format(lfw[x].TIMESTAMP*1000)+"</small></td></tr>";
  }
  for(x=0;x<hire.length;x++) {
    out_hire+="<tr><td class='type'>"+(hire[x].TYPE===1?"LFW":"HIRING")+"</td><td class='post'>"+striptags(hire[x].MESSAGE)+"<br><small>Submitted by <u>"+hire[x].NICK+"</u> about "+timeago.format(hire[x].TIMESTAMP*1000)+"</small></td></tr>";
  }
  fs.writeFileSync(constants.HTML_INDEX+"/index.html",out_all);
  fs.chmodSync(constants.HTML_INDEX+"/index.html",0755);

  fs.writeFileSync(constants.HTML_INDEX+"/lfw.html",out_lfw);
  fs.chmodSync(constants.HTML_INDEX+"/lfw.html",0755);

  fs.writeFileSync(constants.HTML_INDEX+"/hire.html",out_hire);
  fs.chmodSync(constants.HTML_INDEX+"/hire.html",0755);

  fs.writeFileSync(constants.HTML_INDEX+"/index.json",JSON.stringify(all));
  fs.writeFileSync(constants.HTML_INDEX+"/lfw.json",JSON.stringify(lfw));
  fs.writeFileSync(constants.HTML_INDEX+"/hire.json",JSON.stringify(hire));
  fs.writeFileSync(constants.HTML_INDEX+"/index.xml",rss.createRSS(all));
  fs.writeFileSync(constants.HTML_INDEX+"/lfw.xml",rss.createRSS(lfw));
  fs.writeFileSync(constants.HTML_INDEX+"/hire.xml",rss.createRSS(hire));
}
