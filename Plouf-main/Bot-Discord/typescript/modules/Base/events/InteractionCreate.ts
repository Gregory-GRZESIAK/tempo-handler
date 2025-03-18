import { Client, Events, ChatInputCommandInteraction } from "discord.js";

interface Command {
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

interface CommandsCollection extends Map<string, Command> {}

interface ExtendedClient extends Client {
    commands: CommandsCollection;
}
interface UserCooldown {
    endAt: number;
}
const map = new Map()
const event = {
    name: Events.InteractionCreate,
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as ExtendedClient;
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: `No command found for: **${interaction.commandName}**.`,
                    ephemeral: true
                });
            }
            return;
        }

        try {
            if (!map.has(`${interaction.user.id}_${interaction.commandId}`)) {
                map.set(`${interaction.user.id}_${interaction.commandId}`, { endAt: Math.round(Date.now() / 1000) + 5 });
                setTimeout(() => {
                    map.delete(`${interaction.user.id}_${interaction.commandId}`)
                }, 5000);

                await command.execute(interaction);
            } else {
                const user = map.get(`${interaction.user.id}_${interaction.commandId}`) as UserCooldown;
                const duration = (user.endAt - Math.round(Date.now() / 1000));
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({
                        content: `Calm down buddy.. ok ? You can use this command in **${duration}**s.`,
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: `An error occurred while executing the command: **${interaction.commandName}**.`,
                    ephemeral: true
                });
            }
            console.error(error);
        }
    },
};

export default event;
