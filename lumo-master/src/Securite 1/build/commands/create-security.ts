import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { BaseEmbed } from '../../../Handler/build/base/components/BaseEmbed.js';
import { CommandBuilder } from '../../../Handler/build/base/components/CommandBuilder.js';

export default CommandBuilder({
    name: 'create-security',
    description: 'A template command',
    slash: true,
    permLevel: 1,
    category: 'Template',
    args: [],
}, async (interaction, app) => {
    const optionsSecurity = [
        {
            Label: 'Bouton',
            Value: 'bouton',
            Description: 'Adoptez la simplicité avec un bouton pour les arrivants !',
            Emoji: '🔘' // Emoji pour cette option
        },
        {
            Label: 'Captcha',
            Value: 'captcha',
            Description: 'Protégez votre serveur via un captcha pour tous les arrivants !',
            Emoji: '🛡️' // Emoji pour cette option
        },
        {
            Label: 'Puzzle',
            Value: 'puzzle',
            Description: 'Protégez votre serveur via un puzzle simple pour tous les arrivants !',
            Emoji:'🧩' // Emoji pour cette option
        },
        {
            Label: 'Option 4',
            Value: 'option4',
            Description: "Protégez votre serveur via l'option 3 pour tous les arrivants !",
            Emoji: '👀' // Emoji pour cette option
        },
        {
            Label: 'Option 5',
            Value: 'option5',
            Description: "Protégez votre serveur via l'option 3 pour tous les arrivants !",
            Emoji: '🤓' // Emoji pour cette option
        }
    ];
    
    const menu = new StringSelectMenuBuilder()
        .setCustomId(`securite1-${interaction.user.id}`)
        .setPlaceholder('Sélectionnez une sécurité');
    
    optionsSecurity.forEach(option => {
        menu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(option.Label)
                .setValue(option.Value)
                .setDescription(option.Description)
                .setEmoji(option.Emoji) // Ajout de l'emoji
        );
    });
    
        
        
    const embed = new BaseEmbed()
        .setTitle(`Concevoir sa sécurité pour son serveur`)
        .setDescription(`Veuillez sélectionnez l'option que vous souhaitez utilisé comme sécurité pour votre serveur`);

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    
    await interaction.reply({embeds: [embed], components: [actionRow]});
});
