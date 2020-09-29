require('dotenv').config();
const { Client } = require('discord.js');
const client = new Client();
const createCaptcha = require('./captcha');
const fs = require('fs').promises;
const { token } = require('./config.json');;

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`on the server.`, {
    type: 'WATCHING'
  });
  
});
client.on('guildMemberAdd', async member => {
				const channel = member.guild.channels.cache.find(ch => ch.name === 'general'); 
    const captcha = await createCaptcha();
    try {
        const msg = await member.send(`Welcome ${member.user}! \nPlease make sure to read <#691745750253568041>. \n\nWelcome to **Project : Server!** \n• This is the support server for **Gin-san**. This is the place to keep you updated on the **__BOT__** you also can **__send suggestions__**, **__report bugs__**, and **__send feedback__**. \n\n• BOT Invite: 'https://bit.ly/2NtdTWy' \n\n**Please enter the given captcha below to verify**. \n(*__you have 30 minutes to enter the captcha or you will be kicked__*)`, {
            files: [{
                attachment: `${__dirname}/captchas/${captcha}.png`,
                name: `${captcha}.png`
            }]
        });
        try {
            const filter = m => {
                if(m.author.bot) return;
                if(m.author.id === member.id && m.content === captcha) return true;
                else {
                    m.channel.send('You entered the captcha incorrectly.');
                    return false;
                }
            };
            const response = await msg.channel.awaitMessages(filter, { max: 1, time: 600000, errors: ['time']});
            if(response) {
                await msg.channel.send('You have verified yourself!');
                await member.roles.add('759836511238750209');
                await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
            }
        }
        catch(err) {
            console.log(err);
            await msg.channel.send('You did not solve the captcha correctly on time.');
            await member.kick();
            await fs.unlink(`${__dirname}/captchas/${captcha}.png`)
                    .catch(err => console.log(err));
        }
    }
    catch(err) {
        console.log(err);
    }
});

client.login(token);
