import {
    MessageReaction,
    User,
} from "discord.js";
// @ts-ignore
import translatte from "translatte";

async function translateAndReply(reaction: MessageReaction, user: User) {
    if (reaction.emoji.name !=="💬") return; // Vérifie que l'emoji est "👍"

    const message = reaction.message; // Message auquel l'emoji a été ajouté

    if (!message || !message.content) return; // Vérifie si le message contient du texte

    try {
        // Détection automatique de la langue
        const detected = await translatte(message.content, { to: "en" });
        const detectedLanguage = detected.from.language.iso;

        // Déterminer la langue cible
        const targetLanguage = detectedLanguage === "fr" ? "en" : "fr";

        // Traduire le message dans la langue cible
        const translation = await translatte(message.content, { to: targetLanguage });

        const langLabel = detectedLanguage === "fr" ? "français" : "anglais";
        const targetLabel = targetLanguage === "fr" ? "français" : "anglais";

        // Répondre sous le message avec une traduction sans ping
        const reply = await message.reply({
            content: `>>> Langue détectée : ${langLabel}. \n Traduction (${langLabel} ➡️ ${targetLabel}) : \n \`\`\`${translation.text}\`\`\``,
            allowedMentions: { users: [] }, // Désactive les mentions des utilisateurs
        });

        // Supprimer la réponse après 10 secondes pour simuler un message éphémère
        setTimeout(() => {
            reply.delete().catch((err) => console.error("Erreur lors de la suppression du message :", err));
        }, 10000); // 10 secondes
    } catch (error) {
        console.error("Erreur lors de la traduction :", error);
        await message.reply({
            content: "Une erreur est survenue lors de la traduction.",
            allowedMentions: { users: [] }, // Désactive les mentions même en cas d'erreur
        });
    }
}

const event = {
    name: "messageReactionAdd",
    async execute(reaction: MessageReaction, user: User) {
        // Ignorer les réactions du bot
        if (user.bot) return;

        // Appeler la fonction de traitement
        await translateAndReply(reaction, user);
    },
};

export default event;
