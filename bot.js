let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
const request = require('request');

const API_URL = 'http://dnd5eapi.co/api/spells';

// api logic to get spells
let spells = [];


// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
let bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        let args = message.substring(1).split(' ');
        let cmd = args[0];
       
        args = args.splice(1);
        request(API_URL,{ json: true }, (err, resp, body) => {
            body.results.forEach(element => {
                spells.push(element);
            });
            
            switch(cmd) {
                
                // !ping
                case 'ping':
                    spells.forEach(e => {
                        bot.sendMessage({
                            to: channelID,
                            message: e.name
                        });
                    });
                break;
                // Just add any case commands if you want to..
             }
        });
     }
});