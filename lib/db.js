// Database
const constants = require("./constants.js");

class Database {
  constructor() {
    this.db=0;
    require('sqlite-async').open(constants.DATABASE_FILE).then(_db => { this.db = _db});
  }

  // Get FRONTPAGE_LIMIT number of results in order of newest first, where newest means the most recent to be promoted to the frotnpage.
  // Returns results as array
  async getFrontpage(type) {
    let results;
    if(typeof type === 'undefined')
      results = await this.db.all("SELECT * FROM POSTS WHERE ISDELETED=0 AND ISEXPIRED=0 ORDER BY TIMESTAMP DESC");
    else
      results = await this.db.all("SELECT * FROM POSTS WHERE TYPE = ? AND ISDELETED=0 AND ISEXPIRED=0 ORDER BY TIMESTAMP DESC",type);
    return results;
  }

  async getExpired() {
    let results = await this.db.all("SELECT * FROM POSTS WHERE ISDELETED=0 AND ISEXPIRED=0 AND TIMESTAMP < ?",
                                    Math.floor(Date.now()/1000) - (60 * 60 * 24 * constants.POST_EXPIRE));
    return results;
  }
  async setExpired(pid) {
    await this.db.run("UPDATE POSTS SET ISEXPIRED = 1 WHERE PID = ?",pid);
  }

  // Check if user is posting too frequently
  // Returns true or false
  async userCanPost(nick) {
    let results = await this.db.all("SELECT * FROM POSTS WHERE NICK = ? AND ISDELETED = 0 AND ISEXPIRED=0",nick);
    if(results.length > 0)
      return false;
    return true;
  }

  // Post
  // Returns last id or 0
  async post(nick,msg,type) {
    let results = await this.db.run("INSERT INTO POSTS (NICK,MESSAGE,TYPE,TIMESTAMP,ISDELETED,ISEXPIRED) VALUES (?,?,?,?,0,0)",
                        nick,msg,type,Math.floor(Date.now()/1000));
    if(results.lastID)
      return results.lastID;
    return 0;
  }

  // findPost
  // return post
  async findPost(pid) {
    let results = await this.db.all("SELECT * FROM POSTS WHERE PID = ? AND ISDELETED = 0 AND ISEXPIRED=0",pid);
    if(results.length === 0)
      return 0;
    return results[0];
  }

  // deletePost
  // Deletes a post if it exists
  async delPost(pid) {
    await this.db.run("UPDATE POSTS SET ISDELETED = 1 WHERE PID = ?",pid);
  }

  // userIsRegistered
  // true or false
  async userIsRegistered(nick) {
    let results = await this.db.all("SELECT * FROM NICKS WHERE NICK = ?",nick.toLowerCase());
    if(results.length>0)
      return true;
    return false;
  }

  // userRegister
  async userRegister(nick) {
    if(await this.userIsRegistered(nick))
      return false;
    else {
      let results = await this.db.run("INSERT INTO NICKS (NICK) VALUES (?)",nick.toLowerCase());
      if(results.lastID)
        return true;
      return false;
    }
  }
};

module.exports = {
  Database
}
