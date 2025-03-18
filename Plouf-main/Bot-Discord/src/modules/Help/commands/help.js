var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import recursive from 'recursive-readdir';
import { MiscCommand } from '../../../base/structure/commandType.js';
import { executeRoleBasedCommand } from '../../../base/structure/commandExecutor.js';
const command = {
    help: {
        Name: "Help",
        Emoji: "☝️",
        DescriptionShort: "Affiche les informations des commandes.",
        DescriptionLong: "Affiche une liste complète des commandes ou les détails d'une commande spécifique."
    },
    data: new MiscCommand()
        .setName("help")
        .setDescription("Afficher les informations des commandes du bot.")
        .addStringOption(option => option.setName('command')
        .setDescription('Le nom d\'une commande spécifique')
        .setRequired(false)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeRoleBasedCommand(interaction, 1, false, (interaction) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                yield interaction.deferReply();
                const commandName = interaction.options.getString("command");
                if (commandName) {
                    // Afficher les détails d'une commande spécifique
                    try {
                        const files = yield recursive("commands/");
                        const file = files.find(f => f.includes(`${commandName}.js`));
                        if (!file) {
                            interaction.followUp({ content: `❌ La commande \`${commandName}\` n'a pas été trouvée.`, ephemeral: true });
                            return;
                        }
                        const commandModule = yield import(`../../${file}`);
                        if (!commandModule.default.help) {
                            interaction.followUp({ content: `❌ La commande \`${commandName}\` n'a pas de module d'aide.`, ephemeral: true });
                            return;
                        }
                        const commandHelp = commandModule.default.help;
                        const embed = new EmbedBuilder()
                            .setColor(0x00FF99)
                            .setTitle(`📖 Commande : ${commandHelp.Name}`)
                            .setDescription(commandHelp.DescriptionLong || "Aucune description fournie.")
                            .addFields({ name: "💡 Description courte", value: commandHelp.DescriptionShort || "Non définie.", inline: false }, { name: "📝 Nom", value: commandHelp.Name || "Non défini.", inline: false })
                            .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
                        interaction.followUp({ embeds: [embed] });
                    }
                    catch (err) {
                        console.error(err);
                        interaction.followUp({ content: "❌ Une erreur est survenue lors de la récupération des informations de la commande.", ephemeral: true });
                    }
                }
                else {
                    // Afficher la liste de toutes les commandes
                    try {
                        const files = yield recursive("commands/");
                        const categories = {};
                        for (const file of files) {
                            const parts = file.split(/\\|\//); // Support Windows et Unix
                            const category = parts[parts.length - 2]; // Obtenir le dossier parent comme catégorie
                            const commandModule = yield import(`../../${file}`);
                            if (!commandModule.default.help) {
                                continue;
                            }
                            const commandHelp = commandModule.default.help;
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
                            .setFooter({ text: "Utilisez /help <command> pour plus de détails.", iconURL: ((_a = interaction.client.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL()) || "" });
                        const actionRows = [];
                        let currentRow = new ActionRowBuilder();
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
                                currentRow = new ActionRowBuilder();
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
                    }
                    catch (err) {
                        console.error(err);
                        interaction.followUp({ content: "❌ Une erreur est survenue lors de la récupération des commandes.", ephemeral: true });
                    }
                }
            }));
        });
    }
};
export default command;
