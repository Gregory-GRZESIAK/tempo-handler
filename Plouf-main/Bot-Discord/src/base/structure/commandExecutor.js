var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { promises as fs } from 'fs';
// Charger dynamiquement les données à chaque appel
function getRoleData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile('dataCommandExecutor.json', 'utf-8'); // Chemin relatif au projet
            return JSON.parse(data);
        }
        catch (error) {
            console.error("Erreur lors du chargement des données des rôles :", error);
            throw new Error("Impossible de charger les données des rôles.");
        }
    });
}
export function executeRoleBasedCommand(interaction_1, requiredLevel_1) {
    return __awaiter(this, arguments, void 0, function* (interaction, requiredLevel, // Niveau requis pour la commande,
    requireExactLevel = false, commandCallback // Nouveau paramètre : true = niveau exact requis, false = hiérarchie
    ) {
        var _a, _b, _c;
        // Recharger les données à chaque exécution
        const roleData = yield getRoleData();
        const guild = interaction.guild;
        if (!guild) {
            yield interaction.reply({
                content: "❌ Vous devez être dans un serveur pour exécuter cette commande.",
                ephemeral: true
            });
            return;
        }
        const member = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.cache.get((_b = interaction.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!member || !("roles" in member)) {
            yield interaction.reply({
                content: "❌ Impossible de vérifier vos rôles.",
                ephemeral: true
            });
            return;
        }
        const memberRoles = member.roles.cache;
        const serverRoles = ((_c = roleData.servers[guild.id]) === null || _c === void 0 ? void 0 : _c.roles) || {};
        // Vérification des niveaux des rôles de l'utilisateur
        const hasAccess = memberRoles.some((role) => {
            const roleLevel = serverRoles[role.id] || 1; // Niveau par défaut : 1
            if (requireExactLevel) {
                // Niveau exact requis
                return roleLevel === requiredLevel;
            }
            else {
                // Hiérarchie : niveau suffisant
                return roleLevel >= requiredLevel;
            }
        });
        if (!hasAccess) {
            const exactText = requireExactLevel
                ? `exactement le niveau ${requiredLevel}`
                : `au moins le niveau ${requiredLevel}`;
            yield interaction.reply({
                content: `❌ Vous n'avez pas un rôle avec ${exactText} pour exécuter cette commande.`,
                ephemeral: true
            });
            return;
        }
        // Si l'utilisateur a le niveau requis, exécuter la commande
        yield commandCallback(interaction, roleData);
    });
}
