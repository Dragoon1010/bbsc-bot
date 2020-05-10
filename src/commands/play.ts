import { Bot } from '../Bot';
import { Message } from 'discord.js';
const ytdl = require('discord-ytdl-core');

module.exports = {
    name: 'play',
    description: 'play sound from youtube',
    args: true,

    async execute(bot: Bot, messageSended: Message, params: Array<string>) {
        const query: Array<string> = params[0] ? params[0].split('?') : null;
        let timecode: number = 0;
        let videoId;

        if (query[1]) {
            const vars: Array<string> = query[1].split('&');
            const varMap: Map<string, string> = new Map();

            vars.forEach((singleVar) => {
                const currentVar: Array<string> = singleVar.split('=');
                varMap.set(currentVar[0], currentVar[1]);
            });

            if (varMap.has('t') || varMap.has('start')) {
                timecode = varMap.has('t') ? parseInt(varMap.get('t')) : parseInt(varMap.get('start'));
                console.log(timecode);
            }

            if (!ytdl.validateURL(query[0]) && varMap.has('v')) {
                videoId = varMap.get('v');
                query[0] = `https://youtu.be/${videoId}`;
            }
        }

        if (bot.voiceConnectionDispatcher !== null) {
            await bot.voiceConnectionDispatcher.end();
        }

        if (query[0] !== null && ytdl.validateURL(query[0])) {
            bot.currentVoiceConnection = await messageSended.member.voice.channel.join();

            let stream = ytdl(query[0], {
                seek: timecode,
                filter: 'audioonly'
            });
            
            bot.voiceConnectionDispatcher = bot.currentVoiceConnection.play(stream, { type: 'opus', volume: 0.5 });
            
            if (timecode != 0) {
                const bufferingMessage = await messageSended.reply('Mise en mémoire tampon de la musique...');
                bot.voiceConnectionDispatcher.on('start', async () => {
                    bufferingMessage.delete();
                    
                    const launchMessage = await messageSended.reply(`Lancement de la musique avec le timecode "${timecode}"`);
    
                    setTimeout(() => {
                        launchMessage.delete();
                    }, 3000);
                });
            }
        } else {
            messageSended.reply('Aucun lien n\'a été donné, ou le lien ne correspond pas a un lien youtube !');
        }
    }
};
