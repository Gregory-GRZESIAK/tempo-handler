import { Client, VoiceState, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, VoiceChannel, TextChannel, CategoryChannel, ChannelType } from 'discord.js';

const db = new Map<string, { channelId: string; queueId: string }>();

async function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    const deleteOldChannel = async (owner: VoiceState["member"]) => {
        if (!owner) return;

        const data = db.get(owner.id);
        if (!data) return;

        const channel = owner.guild.channels.cache.get(data.channelId) as VoiceChannel;
        const queue = owner.guild.channels.cache.get(data.queueId) as VoiceChannel;

        if (channel) await channel.delete();
        if (queue) await queue.delete();

        db.delete(owner.id);
    };

    if (!oldChannel && newChannel?.id === '1327353317923491963') {
        const member = newState.member;
        if (!member) return;

        const username = member.user.globalName ?? member.user.username;
        let channelName = `Salon de ${username}`;
        if (['a', 'e', 'i', 'o', 'u'].some(letter => username.toLowerCase().startsWith(letter))) {
            channelName = `Salon d'${username}`;
        }

        const parent = member.guild.channels.cache.get('1327353262357090405') as CategoryChannel;
        const channel = await member.guild.channels.create({
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
        await channel.setParent(parent, { lockPermissions: false });

        const queue = await member.guild.channels.create({
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
        await queue.setParent(parent, { lockPermissions: false });
        await queue.setPosition(channel.position + 1);

        await member.voice.setChannel(channel);

        const embed = new EmbedBuilder()
            .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png')
            .setColor('#100c0c')
            .setTitle('Salon vocal')
            .setDescription(
                '<:icon_question:1239648123190640741> Ce menu vous permet de gérer votre propre salon vocal personnalisé. Il sera supprimé automatiquement lorsque vous le quitterez.\n\n' +
                '<:icon_pen:1239645651566854335> Renommer le salon\n' +
                '<:icon_member:1239646050566799503> Gérer les membres du salon\n' +
                '<:icon_rules:1239647182764904559> Gérer les permissions des membres'
            );

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

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(btn_1, btn_2, btn_3);

        db.set(member.id, { channelId: channel.id, queueId: queue.id });
        channel.send({ embeds: [embed], components: [row], content: `${member}` });
    } else if (oldChannel && !newChannel) {
        const member = oldState.member;
        if (!member) return;

        if (db.has(member.id) && db.get(member.id)?.channelId === oldChannel.id) {
            await deleteOldChannel(member);
        }
    } else if (oldChannel && newChannel) {
        const member = oldState.member;
        if (!member) return;
        if (db.has(member.id) && db.get(member.id)?.channelId === oldChannel.id) {
            await deleteOldChannel(member);
        }
        const isAQueueChannel = Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id);
        if (isAQueueChannel) {

            const ownerId = db
                ? Array.from(db.entries()).find(([key, value]) => value.queueId === newChannel.id)?.[0]
                : undefined;
            if (ownerId) {
                const ownerData = db.get(ownerId);
                if (ownerData) {
                    const ownerChannel = member.guild.channels.cache.get(ownerData.channelId) as TextChannel;
                    const embed = new EmbedBuilder()
                        .setColor('#100c0c')
                        .setTitle('Arrivée en attente')
                        .setDescription(`<:icon_question:1239648123190640741> Le membre ${member} est arrivé dans votre salon vocal. Voulez-vous le laisser entrer ?\n\n<:dot_success:1246114795740991580> Oui\n<:dot_danger:1246114773846724700> Non`)
                    const btn_1 = new ButtonBuilder()
                        .setCustomId(`accept_${member.id}_${ownerId}`)
                        .setEmoji('1246114795740991580')
                        .setStyle(ButtonStyle.Success)

                    const btn_2 = new ButtonBuilder()
                        .setCustomId(`deny_${member.id}_${ownerId}`)
                        .setEmoji('1246114773846724700')
                        .setStyle(ButtonStyle.Danger)

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(btn_1, btn_2)
                    if (ownerChannel) {
                        ownerChannel.send({ embeds: [embed], components: [row] });
                    }
                }
            }
        }
    } else if (!oldChannel && newChannel && Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id)) {
        const isAQueueChannel = Array.from(db.entries()).some(([key, value]) => value.queueId === newChannel.id);
        const member = newState.member;
        if (isAQueueChannel && member) {
            const ownerId = db
                ? Array.from(db.entries()).find(([key, value]) => value.queueId === newChannel.id)?.[0]
                : undefined;
        
            if (ownerId) {
                const ownerData = db.get(ownerId);
        
                if (ownerData) {
                    const ownerChannel = member.guild.channels.cache.get(ownerData.channelId) as TextChannel;
        
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
        
                        const row = new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(btn_1, btn_2);
        
                        ownerChannel.send({ embeds: [embed], components: [row] });
                    } else {
                        console.error(`Owner channel not found for channelId: ${ownerData.channelId}`);
                    }
                } else {
                    console.error(`Owner data not found for ownerId: ${ownerId}`);
                }
            } else {
                console.error(`Owner ID not found for queueId: ${newChannel.id}`);
            }
        }
        
    }

}

const event = {
    name: 'voiceStateUpdate',
    execute: handleVoiceStateUpdate,
};

export default event;
