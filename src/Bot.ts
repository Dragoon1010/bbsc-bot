import { Client, User, VoiceChannel, TextChannel, VoiceConnection, StreamDispatcher, Message, Collection } from 'discord.js';
import { EventManager } from './EventManager';
import { EmbedMessage, EmbedType,  } from './EmbedMessage';

const fs = require('fs');
const path = require('path');

require('dotenv').config();

export class Bot extends Client {
    private static logChannel: TextChannel;

    public static client: Client;
    public static commands: Collection<string, any> = new Collection();

    public static currentVoiceConnection: VoiceConnection = null;
    public static voiceConnectionDispatcher: StreamDispatcher = null;

    constructor() {
        super();
    }

    static init() {
        this.client = new Client();
        this.client.login(process.env.TOKEN);

        const commandsDir = path.resolve(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.ts'));

        for (const file of commandFiles) {
            const command = require(`${commandsDir}/${file}`);
            this.commands.set(command.name, command);
        }

        new EventManager(this.client);
    };

    static getUserById(userId): Promise<User> {
        return this.client.users.fetch(userId);
    }

    static async getVoiceChannelById(channelId): Promise<VoiceChannel> {
        return this.client.channels.fetch(channelId) as unknown as VoiceChannel;
    }

    static async writeLog(type: EmbedType, user: User, message: String = '') {
        if (typeof this.logChannel === 'undefined') {
            this.logChannel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID) as unknown as TextChannel;
        }

        const embedMessage: EmbedMessage = new EmbedMessage(type, user, message);

        this.logChannel.send(embedMessage);
    }
}