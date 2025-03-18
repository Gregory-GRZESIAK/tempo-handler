import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";
// @ts-ignore
import translatte from "translatte";

const Command = {
    help: {
        Name: "Translate",
        Emoji: "🌍",
        DescriptionShort: "Traduire un texte automatiquement entre français et anglais.",
        DescriptionLong: "Cette commande détecte la langue d'un texte donné et le traduit automatiquement vers l'autre langue."
    },
    data: new MiscCommand()
        .setName("translate")
        .setDescription("Traduit un texte automatiquement entre français et anglais.")
        .addStringOption((option) =>
            option
                .setName("texte")
                .setDescription("Le texte à traduire.")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await executeRoleBasedCommand(interaction, 1, false, async (interaction: ChatInputCommandInteraction) => {
            const texte = interaction.options.getString("texte");

            if (!texte) {
                await interaction.reply("Aucun texte fourni pour la traduction.");
                return;
            }

            try {
                
                const detected = await translatte(texte, { to: "en" });
                const detectedLanguage = detected.from.language.iso; 

                // Déterminer la langue cible
                const targetLanguage = detectedLanguage === "fr" ? "en" : "fr";

                // Traduction vers la langue cible
                const traduction = await translatte(texte, { to: targetLanguage });

                const langLabel = detectedLanguage === "fr" ? "français" : "anglais";
                const targetLabel = targetLanguage === "fr" ? "français" : "anglais";

                await interaction.reply(
                    `Langue détectée : ${langLabel}.\nTraduction (${langLabel} ➡️ ${targetLabel}) : \`${traduction.text}\``
                );
            } catch (err) {
                console.error("Erreur lors de la traduction :", err);
                await interaction.reply("Une erreur est survenue lors de la traduction.");
            }
        });
    },
};

export default Command;
