import { executeRoleBasedCommand } from '../../../base/structure/commandExecutor.js';
import { AdminCommand } from '../../../base/structure/commandType.js';
import {
    ChatInputCommandInteraction,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    TextChannel,
} from 'discord.js';

const TICKET_CATEGORY_ID = 'CATEGORY_ID_HERE';
const MOD_ROLE_ID = 'MOD_ROLE_ID_HERE';
const MESSAGE_CHANNEL_ID = 'MESSAGE_CHANNEL_ID_HERE';

const command = {
    help: {
        Name: "Create ticket",
        DescriptionShort: "Creates a ticketing message.",
        DescriptionLong: "Allows users to open support tickets via a button.",
    },
    data: new AdminCommand()
        .setName("create-ticket")
        .setDescription("Creates a ticketing system message."),
    async execute(interaction: ChatInputCommandInteraction) {
        await executeRoleBasedCommand(interaction, 9, false, async (interaction: ChatInputCommandInteraction) => {
            const clearMessages = async (channel: TextChannel) => {
                                const messages = await channel.messages.fetch();
                                if (messages.size > 0) {
                                    await channel.bulkDelete(messages, true).catch(console.error);
                                }
                            };
            // Message content for opening a ticket
            const embed = new EmbedBuilder()
                .setTitle('<:icon_folder:1327707360302731346> Open a Support Ticket')
                .setDescription(
                    "Need help or support? Click the button below to create a ticket. Our team will assist you shortly!"
                )
                .setColor(0x9b59b6) // Violet
                .setImage("https://cdn.discordapp.com/attachments/1327695061068288064/1327734804782776442/barre_violet.png?ex=678424e5&is=6782d365&hm=55128574e4b3505f8d5e882e3fac95ac46397f779385ca16b51298dda3a0461c&")
                .setFooter({
                    text: 'Thank you for reaching out. We’re here to help!',
                    iconURL: 'https://cdn.discordapp.com/attachments/1327695061068288064/1327735411493310575/image.png?ex=67842576&is=6782d3f6&hm=ad86e05c5be85173f72c621ef72027f234d58360b316901a6b9dbac265e37b29&',
                });

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`open_ticket`)
                        .setLabel('Open Ticket')
                        .setStyle(ButtonStyle.Primary)
                );

            const messageChannel = await interaction.guild?.channels.fetch("1325244565787250789") as TextChannel;

            await clearMessages(messageChannel);

            if (messageChannel?.isTextBased()) {
                await messageChannel.send({ embeds: [embed], components: [row] });
                await interaction.reply({ content: 'Ticket message sent!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to find the target channel.', ephemeral: true });
            }
        });
    },
};

export default command;
