// User Input Constants
const POST_MIN_LENGTH = 10;

// Days to expire posts
const POST_EXPIRE = 7;

// Password
const PASSWORD_FILE = "/home/shellsuser/Software/jobsbot/.password";

// Db
const DATABASE_FILE = '/home/shellsuser/Software/jobsbot/bot.db';

// Output
const HTML_INDEX = "/home/shellsuser/Software/jobsbot/output/";

// Bold
const BOLD = String.fromCharCode(2);

// IRC
const JOBS_URL = "https://jobs.freenode.net/";
const IRC_SERVER = "chat.freenode.net";
const IRC_NICK = "JobsBot";
const IRC_USER = "jobsbot";
const IRC_GECOS = "freenode Jobs";
const IRC_CHAN = "#freenode-jobs";

module.exports = {
  POST_MIN_LENGTH,
  POST_EXPIRE,
  PASSWORD_FILE,
  DATABASE_FILE,
  HTML_INDEX,
  BOLD,
  JOBS_URL,
  IRC_SERVER,
  IRC_NICK,
  IRC_USER,
  IRC_GECOS,
  IRC_CHAN
}
