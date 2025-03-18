import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { promises as fs } from "fs";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";

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

let roleData: ServerData | null = null;

async function loadRoleData(): Promise<void> {
    try {
        const data = await fs.readFile("../../dataCommandExecutor.json", "utf-8");
        roleData = JSON.parse(data) as ServerData;
    } catch (error) {
        console.error("Erreur lors du chargement des données des rôles :", error);
        roleData = { servers: {} }; // Initialise avec des données vides si le fichier n'existe pas
    }
}

async function saveRoleData(): Promise<void> {
    try {
        await fs.writeFile("../../dataCommandExecutor.json", JSON.stringify(roleData, null, 4), "utf-8");
    } catch (error) {
        console.error("Erreur lors de l'enregistrement des données des rôles :", error);
    }
}

const command = {
    help: {
        Name: "RoleLevel",
        Emoji: "⭕",
        DescriptionShort: "Description courte Role Level",
        DescriptionLong: "Description longue Role Level"
    },
    data: new SlashCommandBuilder()
        .setName("rolelevel")
        .setDescription("Modifier le niveau d'un rôle dans ce serveur.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Par défaut pour les administrateurs
        .addSubcommand((subcommand) =>
            subcommand
                .setName("add")
                .setDescription("Ajouter ou modifier le niveau d'un rôle.")
                .addRoleOption((option) =>
                    option
                        .setName("role")
                        .setDescription("Le rôle à modifier.")
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName("level")
                        .setDescription("Le niveau du rôle (1-10).")
                        .setMinValue(1)
                        .setMaxValue(10)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("remove")
                .setDescription("Supprimer un rôle de la liste des niveaux.")
                .addRoleOption((option) =>
                    option
                        .setName("role")
                        .setDescription("Le rôle à supprimer.")
                        .setRequired(true)
                )
        ) as SlashCommandBuilder,

    async execute(interaction: ChatInputCommandInteraction) {
        await executeRoleBasedCommand(interaction, 9, false, async (interaction: ChatInputCommandInteraction) => {
            if (!roleData) await loadRoleData();

            if (!roleData) { return }
            const guild = interaction.guild;
            if (!guild) {
                await interaction.reply({
                    content: "❌ Cette commande ne peut être utilisée que dans un serveur.",
                    ephemeral: true,
                });
                return;
            }

            const subcommand = interaction.options.getSubcommand();
            const serverRoles = roleData.servers[guild.id]?.roles || {};

            if (subcommand === "add") {
                // Ajouter ou modifier un rôle
                const role = interaction.options.getRole("role", true);
                const level = interaction.options.getInteger("level", true);

                // Ajouter ou mettre à jour le rôle
                if (!roleData.servers[guild.id]) {
                    roleData.servers[guild.id] = { roles: {} };
                }
                roleData.servers[guild.id].roles[role.id] = level;

                await saveRoleData();
                await interaction.reply({
                    content: `✅ Le rôle **${role.name}** a été défini avec un niveau de **${level}**.`,
                    ephemeral: true,
                });
            } else if (subcommand === "remove") {
                // Supprimer un rôle
                const role = interaction.options.getRole("role", true);

                if (!serverRoles[role.id]) {
                    await interaction.reply({
                        content: `❌ Le rôle **${role.name}** n'a pas de niveau défini.`,
                        ephemeral: true,
                    });
                    return;
                }

                // Supprimer le rôle
                delete roleData.servers[guild.id].roles[role.id];
                await saveRoleData();

                await interaction.reply({
                    content: `✅ Le rôle **${role.name}** a été supprimé de la liste des niveaux.`,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "❌ Commande invalide.",
                    ephemeral: true,
                });
            }
        });
    },
};

export default command;
