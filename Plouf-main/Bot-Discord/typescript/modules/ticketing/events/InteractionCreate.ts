import { Events, ButtonInteraction, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, TextChannel } from "discord.js";
import { writeFile, unlink } from "fs/promises";

function createActionRow(buttons: ButtonBuilder[]) {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}

function createButton(id: string, label: string, style: ButtonStyle) {
    return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
}

function createAdminButtons() {
    return createActionRow([
        createButton('save_ticket', 'Save Ticket', ButtonStyle.Success),
        createButton('delete_ticket', 'Delete Ticket', ButtonStyle.Danger),
    ]);
}

async function handleOpenTicket(interaction: ButtonInteraction) {
    const guild = interaction.guild;
    const channelName = `ticket-${interaction.user.username}`;
    const messageChannelOpen = "Welcome to your support ticket.";
    const messageChannelClose = "Are you sure you want to close this ticket?";

    const ticketChannel = await guild?.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: "1325002783455314023",
        permissionOverwrites: [
            { id: guild.id, deny: ['ViewChannel'] },
            { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages'] },
        ],
    });

    if (!ticketChannel) {
        return await interaction.reply({ content: "Failed to create ticket channel.", ephemeral: true });
    }

    const quitButton = createButton(`quit_ticket§${messageChannelOpen}§${messageChannelClose}`, 'Close Ticket', ButtonStyle.Danger);
    const row = createActionRow([quitButton]);

    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Support Ticket')
        .setDescription(messageChannelOpen);

    await ticketChannel.send({
        content: `[@Mod] A ticket has been opened by <@${interaction.user.id}>.`,
        embeds: [embed],
        components: [row],
    });

    await interaction.reply({ content: `Ticket created: ${ticketChannel.name}`, ephemeral: true });
}

async function handleQuitTicket(interaction: ButtonInteraction) {
    const [, , messageChannelClose] = interaction.customId.split('§');
    const confirmButton = createButton('confirm_quit', 'Confirm Close', ButtonStyle.Danger);
    const cancelButton = createButton(interaction.customId.replace('quit_ticket', 'cancel_quit'), 'Cancel', ButtonStyle.Secondary);
    const row = createActionRow([confirmButton, cancelButton]);

    await interaction.update({ content: messageChannelClose, components: [row] });
}

async function handleCancelQuit(interaction: ButtonInteraction) {
    const [id, messageChannelOpen] = interaction.customId.split('§');
    const quitButton = createButton(`quit_ticket§${messageChannelOpen}§${id}`, 'Close Ticket', ButtonStyle.Danger);
    const row = createActionRow([quitButton]);

    await interaction.update({ content: "Ticket close request canceled.", components: [row] });
}

async function handleConfirmQuit(interaction: ButtonInteraction) {
    if (interaction.channel?.type !== ChannelType.GuildText) return;

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: false });
    await interaction.update({ content: "Administrative actions:", components: [createAdminButtons()] });
    await interaction.channel.send({ content: "The ticket has been closed." });
}

async function handleSaveTicket(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    const guild = interaction.guild;

    const messages = await channel.messages.fetch();
    const content = messages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse().join('\n');

    const logChannel = guild?.channels.cache.find(ch => ch.name === 'log_ticket' && ch.type === ChannelType.GuildText) as TextChannel;
    if (!logChannel) {
        return await interaction.reply({ content: "Log channel not found.", ephemeral: true });
    }

    const date = new Date().toISOString().slice(0, 10);
    const filename = `ticket-log-${channel.name}-${date}.txt`;

    try {
        await writeFile(filename, content);
        await logChannel.send({ content: `Log for ${channel.name}`, files: [filename] });
        await interaction.reply({ content: "Ticket has been saved to logs.", ephemeral: true });
        await unlink(filename);
    } catch (error) {
        console.error('Error saving the ticket log:', error);
        await interaction.reply({ content: "Failed to save ticket to logs.", ephemeral: true });
    }
}

async function handleDeleteTicket(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    await channel.delete();
    await interaction.reply({ content: "Ticket channel deleted.", ephemeral: true });
}

const event = {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        const handlers: Record<string, (interaction: ButtonInteraction) => Promise<void>> = {
            open_ticket: async (interaction: ButtonInteraction) => {
                await handleOpenTicket(interaction);
            },
            quit_ticket: async (interaction: ButtonInteraction) => {
                await handleQuitTicket(interaction);
            },
            cancel_quit: async (interaction: ButtonInteraction) => {
                await handleCancelQuit(interaction);
            },
            confirm_quit: async (interaction: ButtonInteraction) => {
                await handleConfirmQuit(interaction);
            },
            save_ticket: async (interaction: ButtonInteraction) => {
                await handleSaveTicket(interaction);
            },
            delete_ticket: async (interaction: ButtonInteraction) => {
                await handleDeleteTicket(interaction);
            },
        };
        

        const id = interaction.customId.split('§')[0];
        if (handlers[id]) {
            await handlers[id](interaction);
        }
    },
};

export default event;
