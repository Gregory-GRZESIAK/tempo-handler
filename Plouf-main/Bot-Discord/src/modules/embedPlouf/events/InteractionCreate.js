var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function handleButtonInteraction(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Check if the interaction is a button
        if (!interaction.isButton())
            return;
        const member = interaction.member;
        if (!member) {
            yield interaction.reply({
                content: "Unable to find your member profile.",
                ephemeral: true,
            });
            return;
        }
        try {
            // Manage roles based on customId
            const roleId = ROLE_IDS[interaction.customId];
            if (!roleId)
                return;
            const role = (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.get(roleId);
            if (!role) {
                yield interaction.reply({
                    content: `The role corresponding to ID "${roleId}" does not exist on this server.`,
                    ephemeral: true,
                });
                return;
            }
            // Add or remove the role as needed
            if (member.roles.cache.has(role.id)) {
                yield member.roles.remove(role);
                yield interaction.reply({
                    content: `The role **${role.name}** has been removed from you.`,
                    ephemeral: true,
                });
            }
            else {
                yield member.roles.add(role);
                yield interaction.reply({
                    content: `The role **${role.name}** has been assigned to you.`,
                    ephemeral: true,
                });
            }
        }
        catch (error) {
            console.error("Error managing the role:", error);
            yield interaction.reply({
                content: "An error occurred while managing the role.",
                ephemeral: true,
            });
        }
    });
}
const event = {
    name: "interactionCreate",
    execute: handleButtonInteraction,
};
export default event;
