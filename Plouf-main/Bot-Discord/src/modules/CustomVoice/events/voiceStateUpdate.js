var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } from 'discord.js';
const db = new Map();
function handleVoiceStateUpdate(oldState, newState) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const oldChannel = oldState.channel;
        const newChannel = newState.channel;
        const deleteOldChannel = (owner) => __awaiter(this, void 0, void 0, function* () {
            if (!owner)
                return;
            const data = db.get(owner.id);
            if (!data)
                return;
            const channel = owner.guild.channels.cache.get(data.channelId);
            const queue = owner.guild.channels.cache.get(data.queueId);
            if (channel)
                yield channel.delete();
            if (queue)
                yield queue.delete();
            db.delete(owner.id);
        });
        if (!oldChannel && (newChannel === null || newChannel === void 0 ? void 0 : newChannel.id) === '1327353317923491963') {
            const member = newState.member;
            if (!member)
                return;
            const username = (_a = member.user.globalName) !== null && _a !== void 0 ? _a : member.user.username;
            let channelName = `Salon de ${username}`;
            if (['a', 'e', 'i', 'o', 'u'].some(letter => username.toLowerCase().startsWith(letter))) {
                channelName = `Salon d'${username}`;
            }
            const parent = member.guild.channels.cache.get('1327353262357090405');
            const channel = yield member.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: member.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: "1325877627877326978",
                        deny: [PermissionFlagsBits.Connect],
                        allow: [PermissionFlagsBits.ViewChannel]
                    },
                ],
            });
            yield channel.setParent(parent, { lockPermissions: false });
            const queue = yield member.guild.channels.create({
                name: '↝ Attente ↝',
                type: 2,
                permissionOverwrites: [
                    {
                        id: member.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: "1325877627877326978",
                        allow: [PermissionFlagsBits.ViewChannel]
                    },
                ],
            });
            yield queue.setParent(parent, { lockPermissions: false });
            yield queue.setPosition(channel.position + 1);
            yield member.voice.setChannel(channel);
            const embed = new EmbedBuilder()
                .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png')
                .setColor('#100c0c')
                .setTitle('Salon vocal')
                .setDescription('<:icon_question:1239648123190640741> Ce menu vous permet de gérer votre propre salon vocal personnalisé. Il sera supprimé automatiquement lorsque vous le quitterez.\n\n' +
                '<:icon_pen:1239645651566854335> Renommer le salon\n' +
                '<:icon_member:1239646050566799503> Gérer les membres du salon\n' +
                '<:icon_rules:1239647182764904559> Gérer les permissions des membres');
            const btn_1 = new ButtonBuilder()
                .setCustomId(`rename_${member.id}`)
                .setEmoji('1239645651566854335')
                .setStyle(ButtonStyle.Secondary);
            const btn_2 = new ButtonBuilder()
                .setCustomId(`manage_${member.id}`)
                .setEmoji('1239646050566799503')
                .setStyle(ButtonStyle.Secondary);
            const btn_3 = new ButtonBuilder()
                .setCustomId(`permissions_${member.id}`)
                .setEmoji('1239647182764904559')
                .setStyle(ButtonStyle.Secondary);
            const row = new ActionRowBuilder().addComponents(btn_1, btn_2, btn_3);
            db.set(member.id, { channelId: channel.id, queueId: queue.id });
            channel.send({ embeds: [embed], components: [row], content: `${member}` });
        }
        else if (oldChannel && !newChannel) {
            const member = oldState.member;
            if (!member)
                return;
            if (db.has(member.id) && ((_b = db.get(member.id)) === null || _b === void 0 ? void 0 : _b.channelId) === oldChannel.id) {
                yield deleteOldChannel(member);
            }
        }
        else if (oldChannel && newChannel) {
            const member = oldState.member;
            if (!member)
                return;
            if (db.has(member.id) && ((_c = db.get(member.id)) === null || _c === void 0 ? void 0 : _c.channelId) === oldChannel.id) {
                yield deleteOldChannel(member);
            }
            const isAQueueChannel = Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id);
            if (isAQueueChannel) {
                const ownerId = db
                    ? (_d = Array.from(db.entries()).find(([key, value]) => value.queueId === newChannel.id)) === null || _d === void 0 ? void 0 : _d[0]
                    : undefined;
                if (ownerId) {
                    const ownerData = db.get(ownerId);
                    if (ownerData) {
                        const ownerChannel = member.guild.channels.cache.get(ownerData.channelId);
                        const embed = new EmbedBuilder()
                            .setColor('#100c0c')
                            .setTitle('Arrivée en attente')
                            .setDescription(`<:icon_question:1239648123190640741> Le membre ${member} est arrivé dans votre salon vocal. Voulez-vous le laisser entrer ?\n\n<:dot_success:1246114795740991580> Oui\n<:dot_danger:1246114773846724700> Non`);
                        const btn_1 = new ButtonBuilder()
                            .setCustomId(`accept_${member.id}_${ownerId}`)
                            .setEmoji('1246114795740991580')
                            .setStyle(ButtonStyle.Success);
                        const btn_2 = new ButtonBuilder()
                            .setCustomId(`deny_${member.id}_${ownerId}`)
                            .setEmoji('1246114773846724700')
                            .setStyle(ButtonStyle.Danger);
                        const row = new ActionRowBuilder()
                            .addComponents(btn_1, btn_2);
                        if (ownerChannel) {
                            ownerChannel.send({ embeds: [embed], components: [row] });
                        }
                    }
                }
            }
        }
        else if (!oldChannel && newChannel && Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id)) {
            const isAQueueChannel = Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id);
            const member = newState.member;
            if (isAQueueChannel && member) {
                const ownerId = db
                    ? (_e = Array.from(db.entries()).find(([key, value]) => value.queueId === newChannel.id)) === null || _e === void 0 ? void 0 : _e[0]
                    : undefined;
                if (ownerId) {
                    const ownerData = db.get(ownerId);
                    if (ownerData) {
                        const ownerChannel = member.guild.channels.cache.get(ownerData.channelId);
                        if (ownerChannel) {
                            const embed = new EmbedBuilder()
                                .setColor('#100c0c')
                                .setTitle('Arrivée en attente')
                                .setDescription(`<:icon_question:1239648123190640741> Le membre ${member} est arrivé dans votre salon vocal. Voulez-vous le laisser entrer ?\n\n<:dot_success:1246114795740991580> Oui\n<:dot_danger:1246114773846724700> Non`);
                            const btn_1 = new ButtonBuilder()
                                .setCustomId(`accept_${member.id}_${ownerId}`)
                                .setEmoji('1246114795740991580')
                                .setStyle(ButtonStyle.Secondary);
                            const btn_2 = new ButtonBuilder()
                                .setCustomId(`deny_${member.id}_${ownerId}`)
                                .setEmoji('1246114773846724700')
                                .setStyle(ButtonStyle.Secondary);
                            const row = new ActionRowBuilder()
                                .addComponents(btn_1, btn_2);
                            ownerChannel.send({ embeds: [embed], components: [row] });
                        }
                        else {
                            console.error(`Owner channel not found for channelId: ${ownerData.channelId}`);
                        }
                    }
                    else {
                        console.error(`Owner data not found for ownerId: ${ownerId}`);
                    }
                }
                else {
                    console.error(`Owner ID not found for queueId: ${newChannel.id}`);
                }
            }
        }
    });
}
const event = {
    name: 'voiceStateUpdate',
    execute: handleVoiceStateUpdate,
};
export default event;
