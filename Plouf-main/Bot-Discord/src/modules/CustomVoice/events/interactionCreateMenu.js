var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
function handleInteractionCreate(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!interaction.isStringSelectMenu() || !interaction.guild)
            return;
        const args = interaction.customId.split('_');
        const value = (_a = interaction.values[0]) !== null && _a !== void 0 ? _a : [0];
        const values = value.split('_');
        console.log(args);
        if (values[0] === 'menu' && values[1] === 'option') {
            console.log('test');
            const member = (_b = interaction.guild.members.cache.get(values[2])) !== null && _b !== void 0 ? _b : {};
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`menu_${interaction.user.id}`)
                .setPlaceholder('Sélectionnez une action')
                .addOptions(new StringSelectMenuOptionBuilder()
                .setLabel('Expulser')
                .setValue(`move_${member.id}`)
                .setDescription(`Déplacer ${member.user.username}`))
                .addOptions(new StringSelectMenuOptionBuilder()
                .setLabel('Mute')
                .setValue(`mute_${member.id}`)
                .setDescription(`Mute ${member.user.username}`))
                .addOptions(new StringSelectMenuOptionBuilder()
                .setLabel('Demute')
                .setValue(`demute_${member.id}`)
                .setDescription(`Demute ${member.user.username}`))
                .addOptions(new StringSelectMenuOptionBuilder()
                .setLabel('Sourdine')
                .setValue(`deafen_${member.id}`)
                .setDescription(`Mettre en sourdine ${member.user.username}`))
                .addOptions(new StringSelectMenuOptionBuilder()
                .setLabel('Remettre le son')
                .setValue(`undeafen_${member.id}`)
                .setDescription(`Remettre le son de ${member.user.username}`));
            const embed = new EmbedBuilder()
                .setTitle('Gestion des membres')
                .setColor('#100c0c')
                .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png?ex=677f88a6&is=677e3726&hm=573b670f576bd42cf5a0c89b98d5fce037cd3256041ff59e0a884fb515d32087&=&format=webp&quality=lossless&width=1440&height=21')
                .setDescription('<:icon_question:1239648123190640741> Ce menu vous permet de gérer les membres de votre salon vocal personnalisé.');
            const row = new ActionRowBuilder().addComponents(menu);
            interaction.update({ embeds: [embed], components: [row] });
        }
        const handleAction = (action, memberId, message, ephemeralMessage) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!interaction.guild)
                return;
            const member = (_a = interaction.guild.members.cache.get(memberId)) !== null && _a !== void 0 ? _a : {};
            if (action === 'move')
                member.voice.disconnect().catch(() => { });
            if (action === 'mute')
                member.voice.setMute(true);
            if (action === 'demute')
                member.voice.setMute(false);
            if (action === 'deafen')
                member.voice.setDeaf(true);
            if (action === 'undeafen')
                member.voice.setDeaf(false);
            const res = yield interaction.reply({ content: ephemeralMessage, ephemeral: true });
            setTimeout(() => {
                res.delete().catch(() => { });
                interaction.message.delete().catch(() => { });
            }, 10000);
        });
        if (['move', 'mute', 'demute', 'deafen', 'undeafen'].includes(values[0])) {
            const actionMap = {
                move: `Le membre ${values[1]} a été expulsé du salon vocal.`,
                mute: `Le membre ${values[1]} a été mute.`,
                demute: `Le membre ${values[1]} a été démuté.`,
                deafen: `Le membre ${values[1]} a été mis en sourdine.`,
                undeafen: `Le membre ${values[1]} a été remis en son.`
            };
            yield handleAction(values[0], values[1], actionMap[values[0]], actionMap[values[0]]);
        }
    });
}
const event = {
    name: 'interactionCreate',
    execute: handleInteractionCreate,
};
export default event;
