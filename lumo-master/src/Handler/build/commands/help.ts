import { CommandBuilder } from '../base/components/CommandBuilder.js';
import { BaseEmbed } from '../base/components/BaseEmbed.js';

type Category = 'Information' | 'Fun' | 'Moderation' | 'Utility' | 'Music';

export default CommandBuilder({
    name: 'help',
    description: 'Shows a list of all available commands.',
    slash: true,
    permLevel: 0,
    cooldown: 5,
    category: 'Information'
    
}, async (interaction, app) => {

    const embed = new BaseEmbed()
    .setTitle('Menu d\'aide');

    const categories: Category[] = ['Information', 'Fun', 'Moderation', 'Utility', 'Music'];
    let description = '';
    const categoryFr: { [key in Category]: string } = {
        'Information': 'Information',
        'Fun': 'Fun',
        'Moderation': 'Modération',
        'Utility': 'Utilitaire',
        'Music': 'Musique'
    };
    
    categories.forEach((category: Category) => {
        const commands = Array.from(app.commands.values())
            .filter(cmd => cmd.options.category === category)
            .map(cmd => "`"+cmd.options.name+"`")
            .join(' ');

        if (commands) {
            description += `**${categoryFr[category]}**\n${commands}\n\n`;
        }
    });

    embed.setDescription(description.trim());

    await interaction.reply({ embeds: [embed] });
});
