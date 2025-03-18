import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, GuildChannel, MessageFlags, StringSelectMenuBuilder, TextChannel } from 'discord.js';
import { EventBuilder } from '../../../Handler/build/base/components/EventBuilder.js';
import fs from "fs"
import { Channel } from 'diagnostics_channel';

function readJSONFile(filePath: string): any {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);  // Convertir le contenu JSON en objet
    } catch (err) {
        console.error('Erreur de lecture du fichier JSON:', err);
        return null;
    }
}

// Fonction pour écrire dans un fichier JSON
function writeJSONFile(filePath: string, data: any): void {
    try {
        const jsonData = JSON.stringify(data, null, 2);  // Convertir l'objet en chaîne JSON avec indentation
        fs.writeFileSync(filePath, jsonData, 'utf-8');
        console.log('Fichier JSON écrit avec succès');
    } catch (err) {
        console.error('Erreur d\'écriture du fichier JSON:', err);
    }
}

export default EventBuilder({
    name: 'interactionCreate',
    description: 'Handles interactions with the StringSelectMenu',
    category: 'Template'
}, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return; // Vérifie si l'interaction est un Select Menu
    if (!interaction.customId.startsWith('securitepag-')) return; // Vérifie si le customId correspond à ton menu
    if (!interaction.guild) return; // Vérifie si l'interaction est dans un serveur
    
    const [customid, type, ownerId, page, ROLECHOISI, CASINITIAL] = interaction.customId.split('-');
    console.log(interaction.customId)
    console.log(interaction.values[0])
    const values = interaction.values[0].split('_');

    switch (values[1]) {
        case "select" :
                if (type =="Roles"){
                    const roleChoisi = values[2];
                    const channels = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).map(channel => channel);
                    const menu2 = createMenu(1, ownerId, channels, "Channels", roleChoisi, CASINITIAL, false, false);
                    await interaction.update({ content:"Choissisez le salon que vous souhaitez !", components: [menu2] });
                    break;
                }else {// le type choisi est un salon
                    console.log(`Salon choisi : ${values[2]}`)
                    console.log(`Role choisi : ${ROLECHOISI}`); 
                    console.log(`Cas initial : ${CASINITIAL}`);
                    const channel = interaction.guild.channels.cache.get(values[2]) as TextChannel;
                    const button = new ButtonBuilder()
                        .setCustomId(`captcha-${CASINITIAL}-${ROLECHOISI}`)
                        .setLabel("Clique ici")
                        .setStyle(ButtonStyle.Primary);
                                
                    
                    const Row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
                    
                    await channel?.send({ content: "Oui", components: [Row] });

                    await interaction.update({ content: `Vous avez choisi le salon <#${values[2]}> pour le rôle <@&${ROLECHOISI}> \n Cas initial : ${CASINITIAL}`, components: [] });
                    break;
                }
            
            case "next":
                case "previous":
                    let data
                    if (type == "Roles") {
                        data = interaction.guild.roles.cache.filter(role => !role.managed).map(role => role);
                    }else{
                        data = interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).map(channel => channel);
                    }
                    const menu = createMenu(parseInt(values[3]), ownerId, data, type, ROLECHOISI, CASINITIAL, false, false);
                    await interaction.update({ components: [menu] });
                    break;
    }
});



const createMenu = (page:any, ownerId:any, data:any, type:any, ROLECHOISI:string, CASINITIAL:string,  isAdd = false, isRemove = false) => {
    const menu = new StringSelectMenuBuilder()
        .setCustomId(`securitepag-${type}-${ownerId}-${page}-${ROLECHOISI}-${CASINITIAL}`)
        .setPlaceholder('Sélectionnez un rôle');

    const pagination = (page:any, limit:any, array:any) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        return array.slice(start, end);
    };

    const totalPages = Math.ceil(data.length / 5) || 1;
    const paginatedRoles = pagination(page, 5, data);

    menu.addOptions({
        label: `Page ${page}/${totalPages}`,
        value: `empty_page`
    });
    menu.addOptions({
        label: '-',
        value: `empty_padding_1`
    });

    for (let i = 0; i < 5; i++) {
        if (!paginatedRoles[i]) {
            menu.addOptions({
                label: '-',
                value: `empty_${i}`
            });
        } else {
            if (isAdd) {
                menu.addOptions({
                    label: `${i + 1} | ${paginatedRoles[i].name}`,
                    value: `add_role_${type}_${paginatedRoles[i].id}`
                });
            } else if (isRemove) {
                menu.addOptions({
                    label: `${i + 1} | ${paginatedRoles[i].name}`,
                    value: `remove_role_${type}_${paginatedRoles[i].id}`
                });
            } else {
                menu.addOptions({
                    label: `${i + 1} | ${paginatedRoles[i].name}`,
                    value: `${type}_select_${paginatedRoles[i].id}`
                });
            }
        }
    }

    menu.addOptions({
        label: '-',
        value: `empty_padding_2`
    });
    if (totalPages === page && (!isAdd && !isRemove)) {
        menu.addOptions({
            emoji: { id: '1332114821591732316', name: 'add' },
            label: 'Ajouter',
            value: `add_role_${type}`
        });
        menu.addOptions({
            emoji: { id: '1332114896174710804', name: 'remove' },
            label: 'Retirer',
            value: `remove_role_${type}`
        });
    }
    if (page < totalPages) {
        menu.addOptions({
            emoji: { id: '1332114784673464421', name: 'next' },
            label: 'Page suivante',
            value: `${type}_next_page_${page + 1}_${isAdd}_${isRemove}`
        });
    }

    if (page > 1) {
        menu.addOptions({
            emoji: { id: '1332114802407116800', name: 'previous' },
            label: 'Page précédente',
            value: `${type}_previous_page_${page - 1}_${isAdd}_${isRemove}`
        });
    }

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
};
