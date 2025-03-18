import { Client, StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, GuildMember, ButtonBuilder, Guild } from 'discord.js';

async function handleInteractionCreate(interaction: StringSelectMenuInteraction) {
    if (!interaction.isStringSelectMenu() || !interaction.guild) return;

    const args = interaction.customId.split('_');
    const value = interaction.values[0] ?? [0];
    const values = value.split('_');
    console.log(args);

    if (values[0] === 'menu' && values[1] === 'option') {
        console.log('test');
        const member = interaction.guild.members.cache.get(values[2]) ?? {} as GuildMember; 
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`menu_${interaction.user.id}`)
            .setPlaceholder('Sélectionnez une action')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Expulser')
                    .setValue(`move_${member.id}`)
                    .setDescription(`Déplacer ${member.user.username}`)
            )
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Mute')
                    .setValue(`mute_${member.id}`)
                    .setDescription(`Mute ${member.user.username}`)
            )
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Demute')
                    .setValue(`demute_${member.id}`)
                    .setDescription(`Demute ${member.user.username}`)
            )
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Sourdine')
                    .setValue(`deafen_${member.id}`)
                    .setDescription(`Mettre en sourdine ${member.user.username}`)
            )
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Remettre le son')
                    .setValue(`undeafen_${member.id}`)
                    .setDescription(`Remettre le son de ${member.user.username}`)
            );
        const embed = new EmbedBuilder()
            .setTitle('Gestion des membres')
            .setColor('#100c0c')
            .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png?ex=677f88a6&is=677e3726&hm=573b670f576bd42cf5a0c89b98d5fce037cd3256041ff59e0a884fb515d32087&=&format=webp&quality=lossless&width=1440&height=21')
            .setDescription('<:icon_question:1239648123190640741> Ce menu vous permet de gérer les membres de votre salon vocal personnalisé.');

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
        interaction.update({ embeds: [embed], components: [row] });
    }

    const handleAction = async (action: string, memberId: string, message: string, ephemeralMessage: string) => {
        if (!interaction.guild) return ;
        const member = interaction.guild.members.cache.get(memberId) ?? {} as GuildMember;

        if (action === 'move') member.voice.disconnect().catch(() => { });
        if (action === 'mute') member.voice.setMute(true);
        if (action === 'demute') member.voice.setMute(false);
        if (action === 'deafen') member.voice.setDeaf(true);
        if (action === 'undeafen') member.voice.setDeaf(false);

        const res = await interaction.reply({ content: ephemeralMessage, ephemeral: true });
        setTimeout(() => {
            res.delete().catch(() => { });
            interaction.message.delete().catch(() => { });
        }, 10000);
    };

    if (['move', 'mute', 'demute', 'deafen', 'undeafen'].includes(values[0])) {
        const actionMap: any = {
            move: `Le membre ${values[1]} a été expulsé du salon vocal.`,
            mute: `Le membre ${values[1]} a été mute.`,
            demute: `Le membre ${values[1]} a été démuté.`,
            deafen: `Le membre ${values[1]} a été mis en sourdine.`,
            undeafen: `Le membre ${values[1]} a été remis en son.`
        };
        await handleAction(values[0], values[1], actionMap[values[0]], actionMap[values[0]]);
    }
}

const event = {
    name: 'interactionCreate',
    execute: handleInteractionCreate,
};

export default event;
