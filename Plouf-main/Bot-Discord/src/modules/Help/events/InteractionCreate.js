var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from "discord.js";
import recursive from 'recursive-readdir';
function handleButtonInteraction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isButton())
            return;
        const id = interaction.customId;
        if (id.includes("help_")) {
            const helpGroupCommands = id.split("_")[1];
            const listCommand = [];
            const actionRows = [];
            let currentActionRow = new ActionRowBuilder();
            try {
                const files = yield recursive(`./commands/${helpGroupCommands}`);
                for (const file of files) {
                    const commandModule = yield import(`../../${file}`);
                    const commandHelp = commandModule.default.help;
                    if (!commandHelp || !commandHelp.Name || !commandHelp.DescriptionShort) {
                        continue;
                    }
                    listCommand.push({
                        name: commandHelp.Name,
                        description: commandHelp.DescriptionShort,
                        emoji: commandHelp.Emoji || "⚙️" // Émoji par défaut si non spécifié
                    });
                }
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500) // Couleur orange pour la catégorie
                    .setTitle(`📂 Catégorie : ${helpGroupCommands}`)
                    .setDescription(`Voici la liste des commandes pour la catégorie \`${helpGroupCommands}\` :`);
                listCommand.forEach((x) => {
                    if (currentActionRow.components.length === 8) {
                        actionRows.push(currentActionRow);
                        currentActionRow = new ActionRowBuilder();
                    }
                    currentActionRow.addComponents(new ButtonBuilder()
                        .setCustomId(`command_${helpGroupCommands}_${x.name}`) // ID unique pour chaque bouton
                        .setLabel(`${x.emoji} ${x.name}`)
                        .setStyle(ButtonStyle.Primary));
                    embed.addFields({
                        name: `${x.emoji} ${x.name}`,
                        value: x.description,
                        inline: true
                    });
                });
                if (currentActionRow.components.length > 0) {
                    actionRows.push(currentActionRow);
                }
                if (listCommand.length === 0) {
                    embed.setDescription('❌ Aucune commande trouvée pour cette catégorie.');
                }
                interaction.reply({ embeds: [embed], components: actionRows });
            }
            catch (err) {
                console.error(err);
                interaction.reply({ content: '❌ Une erreur est survenue lors de la récupération des commandes.', ephemeral: true });
            }
        }
        else if (id.includes("command_")) {
            const parts = id.split("_");
            const categoryCommand = parts[1];
            const commandName = parts[2];
            try {
                const files = yield recursive(`commands/${categoryCommand}`);
                const file = files.find(f => f.endsWith(`${commandName.toLowerCase()}.js`) || f.endsWith(`${commandName.toLowerCase()}.ts`));
                if (!file) {
                    yield interaction.reply({ content: `❌ Commande \`${commandName}\` non trouvée.`, ephemeral: true });
                    return;
                }
                const commandModule = yield import(`../../${file}`);
                if (!commandModule.default.help) {
                    yield interaction.reply({ content: `❌ La commande \`${commandName}\` n'a pas de module d'aide.`, ephemeral: true });
                    return;
                }
                const commandHelp = commandModule.default.help;
                const embed = new EmbedBuilder()
                    .setColor(0x00FF99) // Couleur verte pour les détails
                    .setTitle(`📖 Commande : ${commandHelp.Emoji || "⚙️"} ${commandHelp.Name}`)
                    .setDescription(commandHelp.DescriptionLong || "Aucune description détaillée disponible.")
                    .addFields({ name: "💡 Description courte", value: commandHelp.DescriptionShort || "Non définie.", inline: false }, { name: "📝 Nom", value: commandHelp.Name || "Non défini.", inline: false })
                    .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
                yield interaction.reply({ embeds: [embed], ephemeral: true });
            }
            catch (err) {
                console.error(`Erreur lors de l'importation ou de l'exécution de la commande ${commandName}:`, err);
                yield interaction.reply({ content: "❌ Une erreur est survenue lors de la récupération des informations de la commande.", ephemeral: true });
            }
        }
    });
}
const event = {
    name: 'interactionCreate',
    execute: handleButtonInteraction
};
export default event;
