import { VoiceState, User, VoiceChannel, Client, Message, GuildMember, TextChannel, DMChannel, GuildEmoji } from "discord.js";
import { Bot } from './Bot';
import { EmbedType } from "./EmbedMessage";

export class EventManager {
    private eventsList: Client;

    constructor(eventList: Client) {
        this.eventsList = eventList;

        this.init();
    }

    init() {
        this.eventsList.on('ready', () => console.log('Bot is ready !'));
        this.eventsList.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => this.onUserVoiceChange(oldState, newState));
        this.eventsList.on('guildMemberAdd', (member: GuildMember) => this.OnUserJoin(member));
        this.eventsList.on('message', (message: Message) => this.onMessage(message));
    }

    onUserVoiceChange(oldState: VoiceState, newState: VoiceState) {
        if (oldState.member.user.bot) return;

        Bot.getUserById(oldState.id).then((user) => {
            if (oldState.channelID === null && newState.channelID !== null) {
                Bot.getVoiceChannelById(newState.channelID).then((channel) => {
                    Bot.writeLog(EmbedType.START_VOICE_CONNECTION, user, `${user.username} vient de se connecter au channel **${channel.name}**.`);
                });
            } else if (oldState.channelID !== null && newState.channelID === null) {
                Bot.getVoiceChannelById(oldState.channelID).then((channel) => {
                    Bot.writeLog(EmbedType.END_VOICE_CONNECTION, user, `${user.username} vient de se déconnecter du channel **${channel.name}**.`);
                });
            }
        });
    }

    onMessage(message: Message) {
        if (message.author.bot) return;

        if (message.channel instanceof DMChannel) {
            return message.reply('Vous ne pouvez pas executer de commande en message privé !');
        }
        
        if (message.content.startsWith('/')) {
            const params: Array<string> = message.content.slice(1).split(/ +/);
            const command: string = params.shift().toLowerCase();
            
            if (!Bot.commands.has(command)) return message.reply('Désolé, cette commande n\'existe pas.');

            try {
                Bot.commands.get(command).execute(message, params);
            } catch (error) {
                console.error(error);
                const emojiBwa: GuildEmoji = Bot.client.emojis.cache.find(emoji => emoji.name === 'bwa');
                message.reply(`Désolé, Il y a eu une erreur en executant cette commande ${emojiBwa}`);
            }
        }
    }

    OnUserJoin(member: GuildMember) {
        member.user.bot ? member.roles.add(process.env.BOT_ROLE_ID) : member.roles.add(process.env.NEW_USER_ROLE_ID);
    }
}