import {
    CommandBuilderOptions,

} from "../interfaces/main.js";
import {
    SlashCommandBuilder,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    APIApplicationCommandOptionChoice,
    PermissionsBitField
} from "discord.js";



export const build = async (options: CommandBuilderOptions): Promise<RESTPostAPIChatInputApplicationCommandsJSONBody> => {
    let errors: string[] = [];
    if (!options.hasOwnProperty('slash')) {
        errors.push("Property 'slash' is missing.");
    }
    if (options.hasOwnProperty('slash') && typeof options.slash !== 'boolean') {
        errors.push(`Property'slash' must be of type 'boolean'. (Received type: ${typeof options.slash})`);
    }
    if (!options.hasOwnProperty('name')) {
        errors.push("Property 'name' is missing.");
    }
    if (options.name && typeof options.name !== 'string') {
        errors.push(`Property 'name' must be of type 'string'. (Received type: ${typeof options.name})`);
    }
    if (!options.hasOwnProperty('description')) {
        errors.push("Property 'description' is missing.");
    }
    if (options.description && typeof options.description !== 'string') {
        errors.push(`Property 'description' must be of type 'string'. (Received type: ${typeof options.description})`);
    }
    if (options.hasOwnProperty('permissions')) {
        try {
            new PermissionsBitField(options.permissions);
        } catch (e) {
            errors.push("Property 'permissions' is invalid.");
        }
    }
    if (!options.hasOwnProperty('permLevel')) {
        errors.push("Property 'permLevel' is missing.");
    }
    if (options.permLevel && typeof options.permLevel !== 'number') {
        errors.push(`Property 'permLevel' must be of type 'number'. (Received type: ${typeof options.permLevel})`);
    }
    if (options.hasOwnProperty('cooldown') && typeof options.cooldown !== 'number') {
        errors.push(`Property 'cooldown' must be of type 'number'. (Received type: ${typeof options.cooldown})`);
    }
    if (options.args) {
        options.args.forEach((arg, i) => {
            if (!arg.hasOwnProperty('name')) {
                errors.push(`Property 'args[${i}].name' is missing.`);
            }
            if (arg.name && typeof arg.name !== 'string') {
                errors.push(`Property 'args[${i}].name' must be of type 'string'. (Received type: ${typeof arg.name})`);
            }
            if (!arg.hasOwnProperty('description')) {
                errors.push(`Property 'args[${i}].description' is missing.`);
            }
            if (arg.name && typeof arg.name !== 'string') {
                errors.push(`Property 'args[${i}].description' must be of type 'string'. (Received type: ${typeof arg.description})`);
            }
            if (arg.hasOwnProperty('choices')) {
                arg.choices?.forEach((choice, j) => {
                    if (!choice.hasOwnProperty('name')) {
                        errors.push(`Property 'args[${i}].choices[${j}].name' is missing.`);
                    }
                    if (choice.name && typeof choice.name !== 'string') {
                        errors.push(`Property 'args[${i}].choices[${j}].name' must be of type'string'. (Received type: ${typeof choice.name})`);
                    }
                    if (!choice.hasOwnProperty('value')) {
                        errors.push(`Property 'args[${i}].choices[${j}].value' is missing.`);
                    }
                    if (choice.value && ['string', 'number'].indexOf(typeof choice.value) === -1) {
                        errors.push(`Property 'args[${i}].choices[${j}].value' must be of types 'string' or 'number'. (Received type: ${typeof choice.value})`);
                    }
                })
            }
            if (arg.hasOwnProperty('required') && typeof arg.required !== 'boolean') {
                errors.push(`Property 'args[${i}].required' must be of type 'boolean'. (Received type: ${typeof arg.required})`);
            }
            if (!arg.hasOwnProperty('type')) {
                errors.push(`Property 'args[${i}].type' is missing.`);
            }
            if (['Attachment', 'User', 'Channel', 'Role', 'Mentionable', 'String', 'Integer', 'Number', 'Boolean', 'Subcommand', 'SubcommandGroup'].indexOf(arg.type) === -1) {
                errors.push(`Property 'args[${i}].type' must be one of 'Attachment', 'User', 'Channel', 'Role', 'Mentionable', 'String', 'Integer', 'Number', 'Boolean', 'Subcommand', 'SubcommandGroup'. (Received type: ${typeof arg.type})`);
            }
        })
    }
    if (errors.length > 0) {
        console.log(`Some errors occured while building the command '${options.name ?? 'No name received.'}': \n\n${errors.join('\n')}.`);
        throw new Error('Invalid command builder options.');
    }
    const builder = new SlashCommandBuilder()
        .setName(options.name)
        .setDescription(options.description)
    if (options.permissions) {
        builder.setDefaultMemberPermissions(options.permissions[0].toString());
    }
    if (!options.args) return builder.toJSON();
    options.args.forEach((arg) => {
        switch (arg.type) {
            case 'Attachment':
                builder.addAttachmentOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'Boolean':
                builder.addBooleanOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'Channel':
                builder.addChannelOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'Integer':
                builder.addIntegerOption((option) => {
                    if (arg.choices) {
                        const choices = arg.choices?.map(choice => ({ name: choice.name, value: Number(choice.value) }));
                        option.addChoices(...choices as APIApplicationCommandOptionChoice<number>[]);
                    }
                    return option
                        .setName(arg.name)
                        .setDescription(arg.description)
                        .setRequired(arg.required ?? false);
                });
                break;
            case 'Mentionable':
                builder.addMentionableOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'Number':
                builder.addNumberOption((option) => {
                    if (arg.choices) {
                        const choices = arg.choices?.map(choice => ({ name: choice.name, value: Number(choice.value) }));
                        option.addChoices(...choices as APIApplicationCommandOptionChoice<number>[]);
                    }
                    return option
                        .setName(arg.name)
                        .setDescription(arg.description)
                        .setRequired(arg.required ?? false);
                });
                break;
            case 'Role':
                builder.addRoleOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'String':
                builder.addStringOption((option) => {
                    if (arg.choices) {
                        const choices = arg.choices.map(choice => {
                            if (typeof choice.value === 'string') {
                                const truncatedValue = choice.value.slice(0, 100);
                                return { name: choice.name, value: truncatedValue };
                            } else {
                                console.error(`Invalid choice value type for String: ${JSON.stringify(choice)}`);
                                throw new Error('Invalid choice value type for String');
                            }
                        });
                        option.addChoices(...choices as APIApplicationCommandOptionChoice<string>[]);
                    }
                    return option
                        .setName(arg.name)
                        .setDescription(arg.description)
                        .setRequired(arg.required ?? false);
                });
                break;
            case 'User':
                builder.addUserOption((option) =>
                    option.setName(arg.name).setDescription(arg.description).setRequired(arg.required ?? false)
                );
                break;
            case 'Subcommand':
                builder.addSubcommand((subcommand) =>
                    subcommand.setName(arg.name).setDescription(arg.description)
                );
                break;
            case 'SubcommandGroup':
                builder.addSubcommandGroup((subcommand) =>
                    subcommand.setName(arg.name).setDescription(arg.description)
                );
                break;
        }
    })
    return builder.toJSON();
}

export const getEnv = (names: string[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    names.forEach(name => {
        result[name] = name in process.env;
    });
    return result;
}
