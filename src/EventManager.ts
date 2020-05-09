import { VoiceState, User, VoiceChannel, Client, Message, GuildMember, TextChannel } from "discord.js";
import { Bot } from './Bot';
import { EmbedType } from "./EmbedMessage";

export class EventManager {
    constructor() {
        Bot.client.on('ready', () => console.log('Bot is ready !'));
        Bot.client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => this.onUserVoiceChange(oldState, newState));
        Bot.client.on('guildMemberAdd', (member: GuildMember) => this.OnUserJoin(member));
        Bot.client.on('message', (message: Message) => this.onMessage(message));
    }

    async onUserVoiceChange(oldState: VoiceState, newState: VoiceState) {
        if (oldState.member.user.bot) return;

        const user: User = await Bot.getUserById(oldState.id);

        if (oldState.channelID === null && newState.channelID !== null) {
            const newChannel: VoiceChannel = await Bot.getVoiceChannelById(newState.channelID);

            Bot.writeLog(EmbedType.START_VOICE_CONNECTION, user, `${user.username} vient de se connecter au channel **${newChannel.name}**.`);
        } else if (oldState.channelID !== null && newState.channelID === null) {
            const oldChannel: VoiceChannel = await Bot.getVoiceChannelById(oldState.channelID);

            Bot.writeLog(EmbedType.END_VOICE_CONNECTION, user, `${user.username} vient de se déconnecter du channel **${oldChannel.name}**.`);
        }
    }

    async onMessage(message: Message) {
        if (message.author.bot) return;
        
        if (message.content.startsWith('/')) {
            const params = message.content.slice(1).split(/ +/);
	        const command = params.shift().toLowerCase();
            
            if (!Bot.commands.has(command)) return console.error(`Error, command ${command} does'nt exist !`);

            try {
                Bot.commands.get(command).execute(Bot.client, message, params);
            } catch (error) {
                console.error(error);
                const emojiBwa = Bot.client.emojis.cache.find(emoji => emoji.name === 'bwa');
                message.reply(`Désolé, Il y a eu une erreur en executant cette commande ${emojiBwa}`);
            }
        }
    }

    async OnUserJoin(member: GuildMember) {
        member.user.bot ? member.roles.add(process.env.BOT_ROLE_ID) : member.roles.add(process.env.NEW_USER_ROLE_ID);
    }
}