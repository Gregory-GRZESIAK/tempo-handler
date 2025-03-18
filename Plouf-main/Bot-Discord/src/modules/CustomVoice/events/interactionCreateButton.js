var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder } from 'discord.js';
function handleInteractionCreate(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!interaction.isButton())
            return;
        const args = interaction.customId.split('_');
        const channel = interaction.channel;
        if (!channel)
            return;
        if (args[0] === 'rename' && args[1] === interaction.user.id) {
            interaction.reply({ content: 'Veuillez écrire le nouveau nom du salon', ephemeral: true });
            channel.awaitMessages({ filter: (m) => m.author.id === interaction.user.id, max: 1, time: 60000, errors: ['time'] })
                .then((collected) => {
                const newName = collected.first().content;
                channel.setName(newName);
                collected.first().delete();
                interaction.editReply({ content: `Salon renommé en **${newName}**` });
            });
        }
        else if (args[0] === 'rename' && args[1] !== interaction.user.id) {
            interaction.reply({ content: 'Vous n\'avez pas la permission de renommer ce salon', ephemeral: true });
        }
        if (args[0] === 'manage' && args[1] === interaction.user.id) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`menu_${interaction.user.id}`)
                .setPlaceholder('Sélectionnez un membre');
            const channel = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.get(interaction.channelId);
            const channelMembers = [...channel.members.filter(member => member.id !== interaction.user.id).values()];
            if (channelMembers.length === 0) {
                menu.setPlaceholder('Aucun membre à gérer');
                menu.setDisabled(true);
                menu.addOptions(new StringSelectMenuOptionBuilder()
                    .setLabel('Aucun membre à gérer')
                    .setValue('no_member')
                    .setDescription('Aucun membre à gérer'));
            }
            else {
                for (const member of channelMembers) {
                    const option = new StringSelectMenuOptionBuilder()
                        .setLabel(`${member.user.username}`)
                        .setValue(`menu_option_${member.id}`)
                        .setDescription(`Gérer ${member.user.username}`);
                    menu.addOptions(option);
                }
            }
            const embed = new EmbedBuilder()
                .setTitle('Gestion des membres')
                .setColor('#100c0c')
                .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png?ex=677f88a6&is=677e3726&hm=573b670f576bd42cf5a0c89b98d5fce037cd3256041ff59e0a884fb515d32087&=&format=webp&quality=lossless&width=1440&height=21')
                .setDescription('<:icon_question:1239648123190640741> Ce menu vous permet de gérer les membres de votre salon vocal personnalisé.');
            const row = new ActionRowBuilder()
                .addComponents(menu);
            interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
        else if (args[0] === 'manage' && args[1] !== interaction.user.id) {
            interaction.reply({ content: 'Vous n\'avez pas la permission de gérer les membres de ce salon.', ephemeral: true });
        }
        if (args[0] === 'permissions' && args[1] === interaction.user.id) {
        }
        if (args[0] === 'accept' && args[2] === interaction.user.id) {
            if (!interaction.guild)
                return;
            const res = yield interaction.reply({ content: `Vous avez accepté la demande de connexion de ${(_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.members.cache.get(args[1])}`, ephemeral: true });
            ((_d = (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.members.cache.get(args[1])) !== null && _d !== void 0 ? _d : {}).voice.setChannel(interaction.channelId).catch(() => { var _a; return interaction.editReply({ content: `Le membre ${(_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get(args[1])} n'est plus dans le salon d'attente.` }); });
            setTimeout(() => {
                res.delete().catch(() => { });
                interaction.message.delete().catch(() => { });
            }, 10000);
        }
        else if (args[0] === 'accept' && args[2] !== interaction.user.id) {
            interaction.reply({ content: 'Vous n\'avez pas la permission d\'accepter cette demande', ephemeral: true });
        }
        if (args[0] === 'deny' && args[2] === interaction.user.id) {
            const res = yield interaction.reply({ content: `Vous avez refusé la demande de connexion de ${(_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.members.cache.get(args[1])}`, ephemeral: true });
            ((_g = (_f = interaction.guild) === null || _f === void 0 ? void 0 : _f.members.cache.get(args[1])) !== null && _g !== void 0 ? _g : {}).voice.disconnect().catch(() => { });
            setTimeout(() => {
                interaction.message.delete().catch(() => { });
                res.delete().catch(() => { });
            }, 10000);
        }
        else if (args[0] === 'deny' && args[2] !== interaction.user.id) {
            interaction.reply({ content: 'Vous n\'avez pas la permission de refuser cette demande', ephemeral: true });
        }
    });
}
const event = {
    name: 'interactionCreate',
    execute: handleInteractionCreate,
};
export default event;
