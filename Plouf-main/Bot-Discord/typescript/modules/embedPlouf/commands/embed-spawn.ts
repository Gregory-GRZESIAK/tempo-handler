import {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextChannel,
} from "discord.js";
import { MiscCommand } from "../../../base/structure/commandType.js";
import { executeRoleBasedCommand } from "../../../base/structure/commandExecutor.js";

const Command = {
    help: {
        Name: "RulesEmbed",
        Emoji: "📜",
        DescriptionShort: "Création d'un règlement interactif",
        DescriptionLong: "Génère des embeds pour les règlements en français et en anglais avec un sommaire et un bouton de validation.",
    },
    data: new MiscCommand()
        .setName('rulesembed')
        .setDescription('Crée des embeds de règlements en français et en anglais avec sommaire et validation'),

    async execute(interaction: ChatInputCommandInteraction) {
        await executeRoleBasedCommand(interaction, 9, false, async (interaction: ChatInputCommandInteraction) => {
            try {
                // Identifiants des salons
                const rulesChannelId = '1325232001900351548';
                const rolesChannelId = '1325244539077922836';

                const rulesChannel = interaction.client.channels.cache.get(rulesChannelId) as TextChannel;
                const rolesChannel = interaction.client.channels.cache.get(rolesChannelId) as TextChannel;

                // Vérifications des salons
                if (!rulesChannel || !rolesChannel) {
                    await interaction.reply({ content: 'Un des salons spécifiés est introuvable.', ephemeral: true });
                    return;
                }

                // Fonction pour supprimer les messages existants
                const clearMessages = async (channel: TextChannel) => {
                    const messages = await channel.messages.fetch();
                    if (messages.size > 0) {
                        await channel.bulkDelete(messages, true).catch(console.error);
                    }
                };

                // Supprimer les messages dans les salons
                await Promise.all([clearMessages(rulesChannel), clearMessages(rolesChannel)]);

                // Envoi des embeds français et anglais dans le salon des règles
                const messageFr = await rulesChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('<:icon_folder:1327707360302731346> Règlement du Serveur')
                            .setDescription(
                                "Bienvenue sur notre serveur ! Merci de lire attentivement ces règles pour garantir une expérience agréable à tous les membres."
                            )
                            .setColor(0x1d3557)
                            .addFields(
                                { name: '<:icon_pin:1327705676419432518> Respect & Bienveillance', value: "Traitez les autres membres avec respect. Aucun harcèlement, insulte ou discours de haine ne sera toléré." },
                                { name: '<:icon_screen:1327705674800431124> Contenu Approprié', value: "Ne partagez que du contenu respectant les règles Discord et les lois en vigueur." },
                                { name: '<:icon_earth:1327705673181692066> Langues', value: "Ce serveur est **bilingue**. Vous pouvez utiliser le **français** ou l'**anglais**." },
                                { name: '<:icon_raid:1327705671227019415> Pas de Spam', value: "Évitez le spam, les répétitions inutiles et les mentions abusives." },
                                { name: '<:icon_message:1327705669448630384> Utilisation des Canaux', value: "Veuillez respecter la description des canaux et utiliser le bon canal pour vos discussions." },
                                { name: '<:icon_temp:1327705667879964774> Sanctions', value: "Tout non-respect des règles peut entraîner des avertissements, des restrictions, voire une exclusion." }
                            )
                            .setImage("https://cdn.discordapp.com/attachments/1327695061068288064/1327708613527208037/barre_bleue.png")
                            .setFooter({
                                text: 'Merci de votre coopération ! Respectons ces règles pour un serveur agréable.',
                                iconURL: 'https://cdn.discordapp.com/attachments/1327695061068288064/1327706931586011156/image.png',
                            }),
                    ],
                });

                const messageEn = await rulesChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('<:icon_folder:1327707360302731346> Server Rules')
                            .setDescription(
                                "Welcome to our server! Please carefully read these rules to ensure a pleasant experience for all members."
                            )
                            .setColor(0x742a2a)
                            .addFields(
                                { name: '<:icon_pin:1327705676419432518> Respect & Kindness', value: "Treat other members with respect. Harassment, insults, or hate speech will not be tolerated." },
                                { name: '<:icon_screen:1327705674800431124> Appropriate Content', value: "Only share content that complies with Discord's rules and applicable laws." },
                                { name: '<:icon_earth:1327705673181692066> Languages', value: "This server is **bilingual**. You may use either **French** or **English**." },
                                { name: '<:icon_raid:1327705671227019415> No Spam', value: "Avoid spamming, unnecessary repetition, and excessive mentions." },
                                { name: '<:icon_message:1327705669448630384> Channel Usage', value: "Please follow the channel descriptions and use the correct channel for your discussions." },
                                { name: '<:icon_temp:1327705667879964774> Sanctions', value: "Breaking these rules may result in warnings, restrictions, or bans." }
                            )
                            .setImage("https://cdn.discordapp.com/attachments/1327695061068288064/1327709140176474174/barre_rouge.png")
                            .setFooter({
                                text: 'Thank you for your cooperation! Let’s keep the server enjoyable for everyone.',
                                iconURL: 'https://cdn.discordapp.com/attachments/1327695061068288064/1327706931586011156/image.png',
                            }),
                    ],
                });

                // Sommaire des règles avec les liens
                await rulesChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('<:icon_folder:1327707360302731346> Sommaire des Règlements')
                            .setDescription(
                                `Cliquez sur une langue pour accéder au règlement correspondant :\n\n` +
                                `<:flag_fr:1327694115030437919> [Règlement Français](https://discord.com/channels/${interaction.guildId}/${rulesChannelId}/${messageFr.id})\n` +
                                `<:flag_en:1327694113189138516> [English Rules](https://discord.com/channels/${interaction.guildId}/${rulesChannelId}/${messageEn.id})`
                            )
                            .setColor(0x2ecc71)
                            .setFooter({ text: '<:icon_check:1327706548193071154> - Veuillez valider après avoir lu le règlement.' }),
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId('validateRules')
                                .setLabel('Je valide / I agree ')
                                .setStyle(ButtonStyle.Success)
                        ),
                    ],
                });


                const notifEmbed = new EmbedBuilder()
                    .setTitle('<:icon_folder:1327707360302731346> Notification Preferences')
                    .setDescription(
                        "Stay informed by subscribing to notifications! Select your preferences by clicking on the emojis below:\n\n" +
                        "<:TwitchIcon:1327717265843552380> **Twitch Notifications**\n" +
                        "<:TiktokIcon:1327717263863844915> **TikTok Notifications**"
                    )
                    .setColor(0xe67e22)
                    .setFooter({
                        text: 'Thank you for staying connected with the latest updates!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1327695061068288064/1327706931586011156/image.png',
                    });
                const laneEmbed = new EmbedBuilder()
                    .setTitle('<:icon_folder:1327707360302731346> Choose Your Preferred Role')
                    .setDescription(
                        "Select your main role by clicking on the corresponding emoji:\n\n" +
                        "<:TopLane:1327717273779310694> **Toplane**\n" +
                        "<:Jungle:1327717272420352020> **Jungle**\n" +
                        "<:MidLane:1327717270641967104> **Midlane**\n" +
                        "<:BotLane:1327717269249458196> **Botlane**\n" +
                        "<:Support:1327717267395575809> **Support**"
                    )
                    .setColor(0x1d3557)
                    .setFooter({
                        text: 'Thank you for selecting your preferred role!',
                        iconURL: 'https://cdn.discordapp.com/attachments/1327695061068288064/1327706931586011156/image.png',
                    });


                const laneButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("toplane")
                        .setEmoji("<:TopLane:1327717273779310694>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("jungle")
                        .setEmoji("<:Jungle:1327717272420352020>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("midlane")
                        .setEmoji("<:MidLane:1327717270641967104>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("botlane")
                        .setEmoji("<:BotLane:1327717269249458196>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("support")
                        .setEmoji("<:Support:1327717267395575809>")
                        .setStyle(ButtonStyle.Secondary)
                );
                const notifButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("notifTwitch")
                        .setEmoji("<:TwitchIcon:1327717265843552380>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId("notifTiktok")
                        .setEmoji("<:TiktokIcon:1327717263863844915>")
                        .setStyle(ButtonStyle.Secondary)
                );
                await rolesChannel.send({ embeds: [laneEmbed], components: [laneButtons] });
                await rolesChannel.send({ embeds: [notifEmbed], components: [notifButtons] });

                // Réponse finale
                await interaction.reply('Les règlements et les rôles ont été générés avec succès.');
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: 'Une erreur est survenue lors de la génération des règlements et des rôles.',
                    ephemeral: true,
                });
            }
        });
    },
};

export default Command;