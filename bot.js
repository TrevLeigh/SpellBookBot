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
            2. Add classes and subclasses to description.
            3. Error handling
        */
        request(API_URL,{ json: true }, (err, resp, body) => {
            let typedSpell = body.results.filter(spell => spell.name === cmd.replace(/-/g,' '))[0];
            if(typedSpell) {
                request(typedSpell.url, {json: true}, (err,resp,body) => {
                    bot.sendMessage({
                        to: channelID,
                        embed: {
                            color: 3447003,
                            title: body.name,
                            description: body.desc.toString().replace(/â€™/g,"'"),
                            fields: [{
                                name: "Higher Level",
                                value: body.higher_level? body.higher_level[0].replace(/â€™/g,"'") : 'cannot be cast at a higher level'
                            },
                            {
                                name: "Casting Time",
                                value: body.casting_time
                            },
                            {
                                name: "Spell Level",
                                value: body.level
                            },
                            {
                                name: "Range/Duration",
                                value: body.range + '/ ' + body.duration
                            },
                            {
                                name: "Concentration/Ritual",
                                value: body.concentration + '/ ' + body.ritual
                            },
                            {
                                name: "Material",
                                value: body.material? body.material: 'No materials required'
                            },
                            {
                                name: "Components",
                                value: body.components.toString()
                            },
                            {
                                name: "School",
                                value: body.school.name
                            }],
                            footer: {
                                text: "Found in: " + body.page
                            }
                        }
                    });
                });
            } else {
                bot.sendMessage({
                    to: channelID,
                    message: 'Sorry could not find spell you are looking for. Please make sure you are using Pascal Case.'
                });
            }
            
        });
    }
});