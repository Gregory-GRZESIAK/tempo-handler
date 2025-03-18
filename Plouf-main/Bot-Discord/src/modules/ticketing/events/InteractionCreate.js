var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Events, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from "discord.js";
import { writeFile, unlink } from "fs/promises";
function createActionRow(buttons) {
    return new ActionRowBuilder().addComponents(buttons);
}
function createButton(id, label, style) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}
function createAdminButtons() {
    return createActionRow([
        createButton('save_ticket', 'Save Ticket', ButtonStyle.Success),
        createButton('delete_ticket', 'Delete Ticket', ButtonStyle.Danger),
    ]);
}
function handleOpenTicket(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const guild = interaction.guild;
        const channelName = `ticket-${interaction.user.username}`;
        const messageChannelOpen = "Welcome to your support ticket.";
        const messageChannelClose = "Are you sure you want to close this ticket?";
        const ticketChannel = yield (guild === null || guild === void 0 ? void 0 : guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: "1325002783455314023",
            permissionOverwrites: [
                { id: guild.id, deny: ['ViewChannel'] },
                { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
            ],
        }));
        if (!ticketChannel) {
            return yield interaction.reply({ content: "Failed to create ticket channel.", ephemeral: true });
        }
        const quitButton = createButton(`quit_ticket§${messageChannelOpen}§${messageChannelClose}`, 'Close Ticket', ButtonStyle.Danger);
        const row = createActionRow([quitButton]);
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Support Ticket')
            .setDescription(messageChannelOpen);
        yield ticketChannel.send({
            content: `[@Mod] A ticket has been opened by <@${interaction.user.id}>.`,
            embeds: [embed],
            components: [row],
        });
        yield interaction.reply({ content: `Ticket created: ${ticketChannel.name}`, ephemeral: true });
    });
}
function handleQuitTicket(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const [, , messageChannelClose] = interaction.customId.split('§');
        const confirmButton = createButton('confirm_quit', 'Confirm Close', ButtonStyle.Danger);
        const cancelButton = createButton(interaction.customId.replace('quit_ticket', 'cancel_quit'), 'Cancel', ButtonStyle.Secondary);
        const row = createActionRow([confirmButton, cancelButton]);
        yield interaction.update({ content: messageChannelClose, components: [row] });
    });
}
function handleCancelQuit(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const [id, messageChannelOpen] = interaction.customId.split('§');
        const quitButton = createButton(`quit_ticket§${messageChannelOpen}§${id}`, 'Close Ticket', ButtonStyle.Danger);
        const row = createActionRow([quitButton]);
        yield interaction.update({ content: "Ticket close request canceled.", components: [row] });
    });
}
function handleConfirmQuit(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (((_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.type) !== ChannelType.GuildText)
            return;
        yield interaction.channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: false });
        yield interaction.update({ content: "Administrative actions:", components: [createAdminButtons()] });
        yield interaction.channel.send({ content: "The ticket has been closed." });
    });
}
function handleSaveTicket(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = interaction.channel;
        const guild = interaction.guild;
        const messages = yield channel.messages.fetch();
        const content = messages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse().join('\n');
        const logChannel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.find(ch => ch.name === 'log_ticket' && ch.type === ChannelType.GuildText);
        if (!logChannel) {
            return yield interaction.reply({ content: "Log channel not found.", ephemeral: true });
        }
        const date = new Date().toISOString().slice(0, 10);
        const filename = `ticket-log-${channel.name}-${date}.txt`;
        try {
            yield writeFile(filename, content);
            yield logChannel.send({ content: `Log for ${channel.name}`, files: [filename] });
            yield interaction.reply({ content: "Ticket has been saved to logs.", ephemeral: true });
            yield unlink(filename);
        }
        catch (error) {
            console.error('Error saving the ticket log:', error);
            yield interaction.reply({ content: "Failed to save ticket to logs.", ephemeral: true });
        }
    });
}
function handleDeleteTicket(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = interaction.channel;
        yield channel.delete();
        yield interaction.reply({ content: "Ticket channel deleted.", ephemeral: true });
    });
}
const event = {
    name: Events.InteractionCreate,
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isButton())
                return;
            const handlers = {
                open_ticket: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleOpenTicket(interaction);
                }),
                quit_ticket: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleQuitTicket(interaction);
                }),
                cancel_quit: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleCancelQuit(interaction);
                }),
                confirm_quit: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleConfirmQuit(interaction);
                }),
                save_ticket: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleSaveTicket(interaction);
                }),
                delete_ticket: (interaction) => __awaiter(this, void 0, void 0, function* () {
                    yield handleDeleteTicket(interaction);
                }),
            };
            const id = interaction.customId.split('§')[0];
            if (handlers[id]) {
                yield handlers[id](interaction);
            }
        });
    },
};
export default event;
