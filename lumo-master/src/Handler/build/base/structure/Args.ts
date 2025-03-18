import { Message, User, Role, Channel, Attachment } from 'discord.js';
import { Arg } from '../interfaces/main.js';

interface UserGetter {
    user: User;
    key: string;
}

interface ChannelGetter {
    channel: Channel;
    key: string;
}

interface RoleGetter {
    role: Role;
    key: string;
}

class Args {
    private args: string[];
    private cmdArgs: Arg[];
    private users: UserGetter[]
    private channels: ChannelGetter[]
    private roles: RoleGetter[]
    constructor(message: Message, cmdArgs: Arg[]) {
        this.args = message.content.trim().split(' ').slice(1);
        this.cmdArgs = cmdArgs, this.users = [], this.channels = [], this.roles = [];
        message.mentions.users?.forEach((user) => {
            const cmdArg = this.cmdArgs.find(arg => arg.type === 'User');
            if (cmdArg) {
                this.users.push({ user, key: cmdArg.name });
                this.cmdArgs.splice(this.cmdArgs.indexOf(cmdArg), 1);
            }
        });
        message.mentions.roles?.forEach((role) => {
            const cmdArg = this.cmdArgs.find(arg => arg.type === 'Role');
            if (cmdArg) {
                this.roles.push({ role, key: cmdArg.name });
                this.cmdArgs.splice(this.cmdArgs.indexOf(cmdArg), 1);
            }
        });
        message.mentions.channels?.forEach((channel) => {
            const cmdArg = this.cmdArgs.find(arg => arg.type === 'Channel');
            if (cmdArg) {
                this.channels.push({ channel, key: cmdArg.name });
                this.cmdArgs.splice(this.cmdArgs.indexOf(cmdArg), 1);
            }
        })

    }
    public getUser(name: string): User | undefined {
        const user = this.users.find(user => user.key === name);
        if (user) {
            return user.user;
        }
        return undefined;
    }
    public getChannel(name: string): Channel | undefined {
        const channel = this.channels.find(channel => channel.key === name);
        if (channel) {
            return channel.channel;
        }
        return undefined;
    }
    public getRole(name: string): Role | undefined {
        const role = this.roles.find(role => role.key === name);
        if (role) {
            return role.role;
        }
        return undefined;
    }
    public get list(): string[] {
        return this.args;
    }
}

export { Args, ChannelGetter, RoleGetter, UserGetter };