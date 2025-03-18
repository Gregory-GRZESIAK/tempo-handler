import { EmbedBuilder } from 'discord.js';

export class BaseEmbed extends EmbedBuilder{
    constructor(){
        super();
        this.setColor('#09090b');
        this.setFooter({ text: 'Powered by lumo.js' });
        this.setImage('https://media.discordapp.net/attachments/1222221558861533234/1239675630086389761/banner-separator.png?ex=677f88a6&is=677e3726&hm=573b670f576bd42cf5a0c89b98d5fce037cd3256041ff59e0a884fb515d32087&=&format=webp&quality=lossless&width=1440&height=21')
    }
}