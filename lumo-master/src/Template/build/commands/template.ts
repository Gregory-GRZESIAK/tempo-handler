import { CommandBuilder } from '../../../Handler/build/base/components/CommandBuilder.js';

export default CommandBuilder({
    name: 'template',
    description: 'A template command',
    slash: true,
    permLevel: 1,
    category: 'Template',
    args: [
        {
            name: 'arg',
            description: 'An argument',
            type: 'String',
            required: true,
        },
    ],
}, async (interaction, app) => {
    await interaction.reply('Hello World!');
});
