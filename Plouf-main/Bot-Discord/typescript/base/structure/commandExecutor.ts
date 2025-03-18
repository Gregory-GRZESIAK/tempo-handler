import { promises as fs } from 'fs';

interface RoleLevels {
    [roleId: string]: number; // Map des rôles et leur niveau
}

interface ServerData {
    servers: {
        [serverId: string]: {
            roles: RoleLevels;
        };
    };
}

// Charger dynamiquement les données à chaque appel
async function getRoleData(): Promise<ServerData> {
    try {
        const data = await fs.readFile('dataCommandExecutor.json', 'utf-8'); // Chemin relatif au projet
        return JSON.parse(data) as ServerData;
    } catch (error) {
        console.error("Erreur lors du chargement des données des rôles :", error);
        throw new Error("Impossible de charger les données des rôles.");
    }
}

export async function executeRoleBasedCommand(
    interaction: any,
    requiredLevel: number, // Niveau requis pour la commande,
    requireExactLevel: boolean = false, 
    commandCallback: Function// Nouveau paramètre : true = niveau exact requis, false = hiérarchie
): Promise<void> {
    // Recharger les données à chaque exécution
    const roleData = await getRoleData();

    const guild = interaction.guild;
    if (!guild) {
        await interaction.reply({
            content: "❌ Vous devez être dans un serveur pour exécuter cette commande.",
            ephemeral: true
        });
        return;
    }

    const member = interaction.guild?.members.cache.get(interaction.user?.id);
    if (!member || !("roles" in member)) {
        await interaction.reply({
            content: "❌ Impossible de vérifier vos rôles.",
            ephemeral: true
        });
        return;
    }

    const memberRoles = member.roles.cache;
    const serverRoles = roleData.servers[guild.id]?.roles || {};

    // Vérification des niveaux des rôles de l'utilisateur
    const hasAccess = memberRoles.some((role: { id: string | number }) => {
        const roleLevel = serverRoles[role.id] || 1; // Niveau par défaut : 1

        if (requireExactLevel) {
            // Niveau exact requis
            return roleLevel === requiredLevel;
        } else {
            // Hiérarchie : niveau suffisant
            return roleLevel >= requiredLevel;
        }
    });

    if (!hasAccess) {
        const exactText = requireExactLevel
            ? `exactement le niveau ${requiredLevel}`
            : `au moins le niveau ${requiredLevel}`;
        await interaction.reply({
            content: `❌ Vous n'avez pas un rôle avec ${exactText} pour exécuter cette commande.`,
            ephemeral: true
        });
        return;
    }

    // Si l'utilisateur a le niveau requis, exécuter la commande
    await commandCallback(interaction, roleData);
}
