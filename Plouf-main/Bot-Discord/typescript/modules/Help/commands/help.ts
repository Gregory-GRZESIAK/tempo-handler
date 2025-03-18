import {ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import recursive from 'recursive-readdir';
import { MiscCommand } from '../../../base/structure/commandType.js';
import { executeRoleBasedCommand } from '../../../base/structure/commandExecutor.js';
interface CommandHelp {
    Name: string;
    Emoji: string;
    DescriptionShort: string;
    DescriptionLong?: string;
}

interface Command {
    help?: CommandHelp;
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

const command: Command = {
    help: {
        Name: "Help",
		Emoji :"☝️",
        DescriptionShort: "Affiche les informations des commandes.",
        DescriptionLong: "Affiche une liste complète des commandes ou les détails d'une commande spécifique."
    },
    data: new MiscCommand()
        .setName("help")
        .setDescription("Afficher les informations des commandes du bot.")
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Le nom d\'une commande spécifique')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await executeRoleBasedCommand(interaction, 1, false, async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();

        const commandName = interaction.options.getString("command");
        if (commandName) {
            // Afficher les détails d'une commande spécifique
            try {
                const files = await recursive("commands/");

                const file = files.find(f => f.includes(`${commandName}.js`));
                if (!file) {
                    interaction.followUp({ content: `❌ La commande \`${commandName}\` n'a pas été trouvée.`, ephemeral: true });
                    return;
                }

                const commandModule = await import(`../../${file}`);

                if (!commandModule.default.help) {
                    interaction.followUp({ content: `❌ La commande \`${commandName}\` n'a pas de module d'aide.`, ephemeral: true });
                    return;
                }

                const commandHelp: CommandHelp = commandModule.default.help;

                const embed = new EmbedBuilder()
                    .setColor(0x00FF99)
                    .setTitle(`📖 Commande : ${commandHelp.Name}`)
                    .setDescription(commandHelp.DescriptionLong || "Aucune description fournie.")
                    .addFields(
                        { name: "💡 Description courte", value: commandHelp.DescriptionShort || "Non définie.", inline: false },
                        { name: "📝 Nom", value: commandHelp.Name || "Non défini.", inline: false }
                    )
                    .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

                interaction.followUp({ embeds: [embed] });

            } catch (err) {
                console.error(err);
                interaction.followUp({ content: "❌ Une erreur est survenue lors de la récupération des informations de la commande.", ephemeral: true });
            }
        } else {
            // Afficher la liste de toutes les commandes
            try {
                const files = await recursive("commands/");

                const categories: Record<string, string[]> = {};
                for (const file of files) {
                    const parts = file.split(/\\|\//); // Support Windows et Unix
                    const category = parts[parts.length - 2]; // Obtenir le dossier parent comme catégorie
                    const commandModule = await import(`../../${file}`);

                    if (!commandModule.default.help) {
                        continue;
                    }

                    const commandHelp: CommandHelp = commandModule.default.help;

                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(`\`${commandHelp.Name}\``);
                }

                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("📋 Liste des commandes")
                    .setDescription("Voici la liste des commandes classées par catégorie :")
                    .setTimestamp()
                    .setFooter({ text: "Utilisez /help <command> pour plus de détails.", iconURL: interaction.client.user?.displayAvatarURL() || "" });

                const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
                let currentRow = new ActionRowBuilder<ButtonBuilder>();
                let buttonCount = 0;

                for (const [category] of Object.entries(categories)) {
                    const button = new ButtonBuilder()
                        .setCustomId(`help_${category}`)
                        .setLabel(category || "Autres")
                        .setStyle(ButtonStyle.Primary);

                    currentRow.addComponents(button);
                    buttonCount++;

                    if (buttonCount === 8) {
                        actionRows.push(currentRow);
                        currentRow = new ActionRowBuilder<ButtonBuilder>();
                        buttonCount = 0;
                    }
                }

                if (currentRow.components.length > 0) {
                    actionRows.push(currentRow);
                }

                for (const [category, commands] of Object.entries(categories)) {
                    embed.addFields({ name: `📂 ${category || "Autres"}`, value: commands.join(" / "), inline: false });
                }

                interaction.followUp({ embeds: [embed], components: actionRows });

            } catch (err) {
                console.error(err);
                interaction.followUp({ content: "❌ Une erreur est survenue lors de la récupération des commandes.", ephemeral: true });
            }
        }
    });
    }
};

export default command;
