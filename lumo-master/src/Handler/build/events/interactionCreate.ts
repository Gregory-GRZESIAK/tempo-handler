import { EventBuilder } from "../base/components/EventBuilder.js";
import { Command, SlashCommandBuilderOptions } from "../base/interfaces/main.js";
import { App } from "../base/structure/App.js";
const map: Map<string, boolean> = new Map();
export default EventBuilder({
    name: 'interactionCreate',
    description: 'Event triggered when an interaction is created.',
    category: 'Utility'
}, async (interaction) => {

    if (!interaction.isChatInputCommand() || !interaction.guild) return;
    const app = interaction.client as App;
    const command = app.commands.get(interaction.commandName) as Command<SlashCommandBuilderOptions>;;
    const cooldown = command?.options.cooldown ?? 5;

    if (!command) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.editReply({ content: `The command named **${interaction.commandName}** does not exist.` });
        } else await interaction.reply({ content: `The command named **${interaction.commandName}** does not exist.`, ephemeral: true });
    }
    const cooldownCode = `${interaction.user.id}_${interaction.commandName}`
    if (map.has(cooldownCode)) {

        await interaction.reply({ content: `You must wait **${command.options.cooldown}s** before using **${interaction.commandName}** again.`, ephemeral: true });
    }
    map.set(cooldownCode, true);
    setTimeout(() => {
        map.delete(cooldownCode);
    }, cooldown * 1000);
    try {
        command.execute(interaction, app);
    } catch (e) {
        console.error(e);

        if (!interaction.deferred && !interaction.replied) {
            await interaction.editReply({ content: `An error occurred while trying to execute **${interaction.commandName}**.` });
        } else await interaction.reply({ content: `An error occurred while trying to execute **${interaction.commandName}**.`, ephemeral: true });
    }
})