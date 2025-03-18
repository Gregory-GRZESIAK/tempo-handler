import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
// Classe de base pour toutes les commandes
class Command extends SlashCommandBuilder {
    constructor() {
        super();
    }
}
// Commande Misc
export class MiscCommand extends Command {
    constructor() {
        super();
    }
}
// Commande Modération
export class ModCommand extends Command {
    constructor() {
        super();
        this.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
    }
}
// Commande Admin
export class AdminCommand extends Command {
    constructor() {
        super();
        this.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    }
}
