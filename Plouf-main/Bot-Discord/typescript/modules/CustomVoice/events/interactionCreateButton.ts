import { Client, ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, ActionRowBuilder, TextChannel, VoiceBasedChannel, Channel, VoiceChannel, User, GuildMember } from 'discord.js';

async function handleInteractionCreate(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return;
    const args = interaction.customId.split('_');
    const channel = interaction.channel as TextChannel;

    if (!channel) return ;
    
    if (args[0] === 'rename' && args[1] === interaction.user.id) {
        interaction.reply({ content: 'Veuillez écrire le nouveau nom du salon', ephemeral: true });
        channel.awaitMessages({ filter: (m: { author: { id: string; }; }) => m.author.id === interaction.user.id, max: 1, time: 60000, errors: ['time'] })
            .then((collected:any) => {
                const newName = collected.first().content;
                channel.setName(newName);
                collected.first().delete();
                interaction.editReply({ content: `Salon renommé en **${newName}**`});
            })
    } else if (args[0] === 'rename' && args[1] !== interaction.user.id) {
        interaction.reply({ content: 'Vous n\'avez pas la permission de renommer ce salon', ephemeral: true });
    }

    if (args[0] === 'manage' && args[1] === interaction.user.id) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId(`menu_${interaction.user.id}`)
            .setPlaceholder('Sélectionnez un membre')
        const channel = interaction.guild?.channels.cache.get(interaction.channelId) as TextChannel;
        const channelMembers = [...channel.members.filter(member => member.id !== interaction.user.id).values()];

        if (channelMembers.length === 0) {
            menu.setPlaceholder('Aucun membre à gérer');
            menu.setDisabled(true);
            menu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Aucun membre à gérer')
                    .setValue('no_member')
                    .setDescription('Aucun membre à gérer')
            )
        } else {
            for (const member of channelMembers) {
                const option = new StringSelectMenuOptionBuilder()
                    .setLabel(`${member.user.username}`)
                    .setValue(`menu_option_${member.id}`)
                    .setDescription(`Gérer ${member.user.username}`)
                menu.addOptions(option);


            }
        }
        const embed = new EmbedBuilder()
            .setTitle('Gestion des membres')
            .setColor('#100c0c')
            .setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png?ex=677f88a6&is=677e3726&hm=573b670f576bd42cf5a0c89b98d5fce037cd3256041ff59e0a884fb515d32087&=&format=webp&quality=lossless&width=1440&height=21')
            .setDescription('<:icon_question:1239648123190640741> Ce menu vous permet de gérer les membres de votre salon vocal personnalisé.')

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(menu);
        interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    } else if (args[0] === 'manage' && args[1] !== interaction.user.id) {
        interaction.reply({ content: 'Vous n\'avez pas la permission de gérer les membres de ce salon.', ephemeral: true });
    }
    
    if (args[0] === 'permissions' && args[1] === interaction.user.id) {

    }

    if (args[0] === 'accept' && args[2] === interaction.user.id) {
        if (!interaction.guild) return;
        const res = await interaction.reply({ content: `Vous avez accepté la demande de connexion de ${interaction.guild?.members.cache.get(args[1])}`, ephemeral: true });
        (interaction.guild?.members.cache.get(args[1]) ?? {} as GuildMember).voice.setChannel(interaction.channelId).catch(() =>
            interaction.editReply({ content: `Le membre ${interaction.guild?.members.cache.get(args[1])} n'est plus dans le salon d'attente.` })
        );
        setTimeout(() => {
            res.delete().catch(() => { });
            interaction.message.delete().catch(() => { });
        }, 10000);
    } else if (args[0] === 'accept' && args[2] !== interaction.user.id) {
        interaction.reply({ content: 'Vous n\'avez pas la permission d\'accepter cette demande', ephemeral: true });
    }

    if (args[0] === 'deny' && args[2] === interaction.user.id) {
        const res = await interaction.reply({ content: `Vous avez refusé la demande de connexion de ${interaction.guild?.members.cache.get(args[1])}`, ephemeral: true });
        (interaction.guild?.members.cache.get(args[1]) ?? {} as GuildMember).voice.disconnect().catch(() => { });
        setTimeout(() => {
            interaction.message.delete().catch(() => { });
            res.delete().catch(() => { });
        }, 10000);
    } else if (args[0] === 'deny' && args[2] !== interaction.user.id) {
        interaction.reply({ content: 'Vous n\'avez pas la permission de refuser cette demande', ephemeral: true });
    }
}

const event = {
    name: 'interactionCreate',
    execute: handleInteractionCreate,
};

export default event;
