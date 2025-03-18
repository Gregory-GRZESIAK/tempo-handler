var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        .addStringOption((option) => option
        .setName("texte")
        .setDescription("Le texte à traduire.")
        .setRequired(true)),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeRoleBasedCommand(interaction, 1, false, (interaction) => __awaiter(this, void 0, void 0, function* () {
                const texte = interaction.options.getString("texte");
                if (!texte) {
                    yield interaction.reply("Aucun texte fourni pour la traduction.");
                    return;
                }
                try {
                    const detected = yield translatte(texte, { to: "en" });
                    const detectedLanguage = detected.from.language.iso;
                    // Déterminer la langue cible
                    const targetLanguage = detectedLanguage === "fr" ? "en" : "fr";
                    // Traduction vers la langue cible
                    const traduction = yield translatte(texte, { to: targetLanguage });
                    const langLabel = detectedLanguage === "fr" ? "français" : "anglais";
                    const targetLabel = targetLanguage === "fr" ? "français" : "anglais";
                    yield interaction.reply(`Langue détectée : ${langLabel}.\nTraduction (${langLabel} ➡️ ${targetLabel}) : \`${traduction.text}\``);
                }
                catch (err) {
                    console.error("Erreur lors de la traduction :", err);
                    yield interaction.reply("Une erreur est survenue lors de la traduction.");
                }
            }));
        });
    },
};
export default Command;
