import {
    ButtonInteraction,
    GuildMember,
} from "discord.js";

const ROLE_IDS = {
    validateRules: "1325877627877326978", // Role for validating rules
    toplane: "1325899960356438036",
    jungle: "1325900039746355260",
    midlane: "1325900047925383218",
    botlane: "1325900052106973345",
    support: "1325900054514503731",
    notifTwitch: "1327724260789190656",
    notifTiktok: "1327724300165447791",
};

async function handleButtonInteraction(interaction: ButtonInteraction) {
    // Check if the interaction is a button
    if (!interaction.isButton()) return;

    const member = interaction.member as GuildMember;
    if (!member) {
        await interaction.reply({
            content: "Unable to find your member profile.",
            ephemeral: true,
        });
        return;
    }

    try {
        // Manage roles based on customId
        const roleId = ROLE_IDS[interaction.customId as keyof typeof ROLE_IDS];
        if (!roleId) return;

        const role = interaction.guild?.roles.cache.get(roleId);

        if (!role) {
            await interaction.reply({
                content: `The role corresponding to ID "${roleId}" does not exist on this server.`,
                ephemeral: true,
            });
            return;
        }

        // Add or remove the role as needed
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({
                content: `The role **${role.name}** has been removed from you.`,
                ephemeral: true,
            });
        } else {
            await member.roles.add(role);
            await interaction.reply({
                content: `The role **${role.name}** has been assigned to you.`,
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error("Error managing the role:", error);
        await interaction.reply({
            content: "An error occurred while managing the role.",
            ephemeral: true,
        });
    }
}

const event = {
    name: "interactionCreate",
    execute: handleButtonInteraction,
};

export default event;
