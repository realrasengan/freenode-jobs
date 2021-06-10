const header = `**** NewsBot Help ****`;
const footer = `**** End of Help ****`;

const help = `JobsBot is the central command for https://jobs.freenode.net - the following commands are available:
LFW - Post a looking for work message.
HIRE - Post a message looking for a skilled worker.
DEL - Delete a POST
You can also get more information with HELP <command>
**** End of Help ****`;

const lfw = `LFW lets you post a looking for work message.
Syntax: LFW <message>
Example: LFW JavaScript Developer - Contractor - Remote - You can see my resume at https://github.com/some - PM me for your JavaScript needs`;

const hire = `HIRE lets you post a looking to hire message.
Syntax: HIRE <message>
Example: HIRE JavaScript Developer - Full Time - Remote - Some Company Name Inc. - https://some.com/ - PM to apply or find out more`;

const del = `DEL lets you delete a POST if you're an @ or the ORIGINAL POSTER
Syntax: DEL <post id>
Only ops and the original poster can delete a post
Example: DEL 1135`;

const none = `No such command `;

module.exports = {
  header,
  footer,
  help,
  lfw,
  hire,
  del,
  none
}
