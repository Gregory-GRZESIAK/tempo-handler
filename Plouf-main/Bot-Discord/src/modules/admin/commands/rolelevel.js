var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { promises as fs } from "fs";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";
let roleData = null;
function loadRoleData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile("../../dataCommandExecutor.json", "utf-8");
            roleData = JSON.parse(data);
        }
        catch (error) {
            console.error("Erreur lors du chargement des données des rôles :", error);
            roleData = { servers: {} }; // Initialise avec des données vides si le fichier n'existe pas
        }
    });
}
function saveRoleData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.writeFile("../../dataCommandExecutor.json", JSON.stringify(roleData, null, 4), "utf-8");
        }
        catch (error) {
            console.error("Erreur lors de l'enregistrement des données des rôles :", error);
        }
    });
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
        .addSubcommand((subcommand) => subcommand
        .setName("add")
        .setDescription("Ajouter ou modifier le niveau d'un rôle.")
        .addRoleOption((option) => option
        .setName("role")
        .setDescription("Le rôle à modifier.")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("level")
        .setDescription("Le niveau du rôle (1-10).")
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true)))
        .addSubcommand((subcommand) => subcommand
        .setName("remove")
        .setDescription("Supprimer un rôle de la liste des niveaux.")
        .addRoleOption((option) => option
        .setName("role")
        .setDescription("Le rôle à supprimer.")
        .setRequired(true))),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            yield executeRoleBasedCommand(interaction, 9, false, (interaction) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (!roleData)
                    yield loadRoleData();
                if (!roleData) {
                    return;
                }
                const guild = interaction.guild;
                if (!guild) {
                    yield interaction.reply({
                        content: "❌ Cette commande ne peut être utilisée que dans un serveur.",
                        ephemeral: true,
                    });
                    return;
                }
                const subcommand = interaction.options.getSubcommand();
                const serverRoles = ((_a = roleData.servers[guild.id]) === null || _a === void 0 ? void 0 : _a.roles) || {};
                if (subcommand === "add") {
                    // Ajouter ou modifier un rôle
                    const role = interaction.options.getRole("role", true);
                    const level = interaction.options.getInteger("level", true);
                    // Ajouter ou mettre à jour le rôle
                    if (!roleData.servers[guild.id]) {
                        roleData.servers[guild.id] = { roles: {} };
                    }
                    roleData.servers[guild.id].roles[role.id] = level;
                    yield saveRoleData();
                    yield interaction.reply({
                        content: `✅ Le rôle **${role.name}** a été défini avec un niveau de **${level}**.`,
                        ephemeral: true,
                    });
                }
                else if (subcommand === "remove") {
                    // Supprimer un rôle
                    const role = interaction.options.getRole("role", true);
                    if (!serverRoles[role.id]) {
                        yield interaction.reply({
                            content: `❌ Le rôle **${role.name}** n'a pas de niveau défini.`,
                            ephemeral: true,
                        });
                        return;
                    }
                    // Supprimer le rôle
                    delete roleData.servers[guild.id].roles[role.id];
                    yield saveRoleData();
                    yield interaction.reply({
                        content: `✅ Le rôle **${role.name}** a été supprimé de la liste des niveaux.`,
                        ephemeral: true,
                    });
                }
                else {
                    yield interaction.reply({
                        content: "❌ Commande invalide.",
                        ephemeral: true,
                    });
                }
            }));
        });
    },
};
export default command;
