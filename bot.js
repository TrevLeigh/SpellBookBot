let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');
const request = require('request');

const API_URL = 'http://dnd5eapi.co/api/spells';

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
        // Api requests to take the user input and search for the spell
        /*
            TODO: 1. Add a way so users do not need to use Pascal Case.
            2. Add more information about spells in embed.
            3. Find way to make sure apostrophe show up.
        */
        request(API_URL,{ json: true }, (err, resp, body) => {
            let typedSpell = body.results.filter(spell => spell.name === cmd.replace(/-/g,' '))[0];
            console.log(cmd.replace('-',' '));
            request(typedSpell.url, {json: true}, (err,resp,body) => {
                bot.sendMessage({
                    to: channelID,
                    embed: {
                        title: body.name,
                        description: body.desc[0]
                    }
                });
            });
            
        });
    }
});