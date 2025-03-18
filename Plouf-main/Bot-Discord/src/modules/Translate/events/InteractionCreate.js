var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-ignore
import translatte from "translatte";
function translateAndReply(reaction, user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (reaction.emoji.name !== "💬")
            return; // Vérifie que l'emoji est "👍"
        const message = reaction.message; // Message auquel l'emoji a été ajouté
        if (!message || !message.content)
            return; // Vérifie si le message contient du texte
        try {
            // Détection automatique de la langue
            const detected = yield translatte(message.content, { to: "en" });
            const detectedLanguage = detected.from.language.iso;
            // Déterminer la langue cible
            const targetLanguage = detectedLanguage === "fr" ? "en" : "fr";
            // Traduire le message dans la langue cible
            const translation = yield translatte(message.content, { to: targetLanguage });
            const langLabel = detectedLanguage === "fr" ? "français" : "anglais";
            const targetLabel = targetLanguage === "fr" ? "français" : "anglais";
            // Répondre sous le message avec une traduction sans ping
            const reply = yield message.reply({
                content: `>>> Langue détectée : ${langLabel}. \n Traduction (${langLabel} ➡️ ${targetLabel}) : \n \`\`\`${translation.text}\`\`\``,
                allowedMentions: { users: [] }, // Désactive les mentions des utilisateurs
            });
            // Supprimer la réponse après 10 secondes pour simuler un message éphémère
            setTimeout(() => {
                reply.delete().catch((err) => console.error("Erreur lors de la suppression du message :", err));
            }, 10000); // 10 secondes
        }
        catch (error) {
            console.error("Erreur lors de la traduction :", error);
            yield message.reply({
                content: "Une erreur est survenue lors de la traduction.",
                allowedMentions: { users: [] }, // Désactive les mentions même en cas d'erreur
            });
        }
    });
}
const event = {
    name: "messageReactionAdd",
    execute(reaction, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ignorer les réactions du bot
            if (user.bot)
                return;
            // Appeler la fonction de traitement
            yield translateAndReply(reaction, user);
        });
    },
};
export default event;
