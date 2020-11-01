import { Client, User, VoiceChannel, TextChannel, VoiceConnection, StreamDispatcher, Collection } from 'discord.js';
import { EmbedMessage, EmbedType } from './EmbedMessage';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
require('dotenv').config();
import BotLogger from './BotLogger';
import { Logger } from 'winston';

export class Bot extends Client {
    private logChannel: TextChannel;

    public commands: Collection<string, any> = new Collection();
    public currentVoiceConnection: VoiceConnection = null;
    public voiceConnectionDispatcher: StreamDispatcher = null;
    public logger: Logger;

    constructor() {
        super();

        this.logger = new BotLogger().start();

        // register all commands
        const commandsDir = path.resolve(__dirname, '..', 'commands');

        glob(`${commandsDir}/**/*.ts`, (err, commandFiles) => {
            commandFiles.forEach((file) => {
                const command = require(file);
                this.commands.set(command.name, command);
            })
        });

        // register all events
        const eventsDir = path.resolve(__dirname, '..', 'events');
        const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.ts'));

        for (const file of eventFiles) {
            const event = require(`${eventsDir}/${file}`);
            super.on(event.name, event.execute.bind(null, this))
        }

        this.logger.log('info', 'bot has started');
    }

    async writeLog(type: EmbedType, user: User, message = ''): Promise<void> {
        if (typeof this.logChannel === 'undefined') {
            this.logChannel = await this.channels.fetch(process.env.LOG_CHANNEL_ID) as unknown as TextChannel;
        }

        const embedMessage: EmbedMessage = new EmbedMessage(type, message, user);
        this.logChannel.send(embedMessage);

        const cleanedMessage = message.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\*/g,'');
        this.logger.log('info', cleanedMessage);
    }
}