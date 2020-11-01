import { Bot } from '../../classes/Bot';
import { Message } from 'discord.js';

module.exports = {
    name: 'ping',
    alias: ['pong'],
    description: '**/ping**: Recevoir un ping du bot',
    isAdmin: false,
    isVoiceCommand: false,
    args: false,

    execute(bot: Bot, messageSended: Message) {
        const fakeIp = `${Math.ceil(Math.random() * 255)}.${Math.ceil(Math.random() * 100)}.${Math.ceil(Math.random() * 100)}.${Math.ceil(Math.random() * 100)}`;

        messageSended.reply(`Envoi d’une requête 'ping' sur ${messageSended.author.username} [${fakeIp}] avec 32 octets de données :`);
        setTimeout(() => {
            
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    messageSended.reply(`Réponse de ${fakeIp} : octets=32 temps=${Math.ceil(Math.random() * 100)} ms TTL=51`);
                }, i * 1000);
            }
        }, 1000);
    }
};