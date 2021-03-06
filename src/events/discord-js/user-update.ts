import { GuildMember, Role } from "discord.js";
import { Bot } from "../../classes/Bot";

const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'guildMemberUpdate',

    execute: (bot: Bot, oldMemberInfos: GuildMember, newMemberInfos: GuildMember) => {
        const amongUsRole: Role = oldMemberInfos.guild.roles.cache.find(role => role.name === 'Mort Among Us');

        if (!oldMemberInfos.roles.cache.has(amongUsRole.id) && newMemberInfos.roles.cache.has(amongUsRole.id) && newMemberInfos.voice.channel) {
            if (bot.currentVoiceConnection) {
                bot.currentVoiceConnection.play(fs.createReadStream(path.resolve(__dirname, '../../static/audio', 'unmute.ogg')), { type: 'ogg/opus' });
            }

            newMemberInfos.voice.channel.members.forEach(async (member: GuildMember) => {
                if (!member.roles.cache.has(process.env.AMONG_US_ROLE_ID)) {
                    member.voice.setMute(false);
                } else {
                    member.voice.setMute(true);
                }
            });
        } else if (oldMemberInfos.roles.cache.has(amongUsRole.id) && !newMemberInfos.roles.cache.has(amongUsRole.id) && newMemberInfos.voice.channel) {
            newMemberInfos.roles.remove(process.env.AMONG_US_ROLE_ID);
            newMemberInfos.voice.setMute(false);
        }
    }
};