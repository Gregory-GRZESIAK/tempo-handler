import { ActionRowBuilder, Component, MessageFlags, StringSelectMenuBuilder } from 'discord.js';
import { EventBuilder } from '../../../Handler/build/base/components/EventBuilder.js';
import { v4 as uuidv4 } from 'uuid';

export default EventBuilder({
    name: 'interactionCreate',
    description: 'Handles interactions with the StringSelectMenu',
    category: 'Template'
}, async (interaction) => {
    if (!interaction.isStringSelectMenu()) return; // Vérifie si l'interaction est un Select Menu
    if (!interaction.customId.startsWith('securite1-')) return; // Vérifie si le customId correspond à ton menu
    if (!interaction.guild) return; // Vérifie si l'interaction est dans un serveur
    const selectedValue = interaction.values[0]; // Récupère la valeur sélectionnée (dans le cas d'une seule option sélectionnée)
    const roles = interaction.guild.roles.cache.filter(role => !role.managed).map(role => role);

    const menu = createMenu(1, interaction.user.id, roles, 'Roles', '.', selectedValue);
    await interaction.update({ content: 'Voici les rôles disponibles :', components: [menu],
                 // Utilisation des flags pour l'éphémère });
    });
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
