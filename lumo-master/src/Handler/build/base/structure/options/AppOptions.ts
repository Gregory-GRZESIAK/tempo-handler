enum AppIntents {
    'Guilds' = 1 << 0,
    'GuildMembers' = 1 << 1,
    'GuildModeration' = 1 << 2,
    'GuildEmojisAndStickers' = 1 << 3,
    'GuildIntegrations' = 1 << 4,
    'GuildWebhooks' = 1 << 5,
    'GuildInvites' = 1 << 6,
    'GuildVoiceStates' = 1 << 7,
    'GuildPresences' = 1 << 8,
    'GuildMessages' = 1 << 9,
    'GuildMessageReactions' = 1 << 10,
    'GuildMessageTyping' = 1 << 11,
    'DirectMessages' = 1 << 12,
    'DirectMessageReactions' = 1 << 13,
    'DirectMessageTyping' = 1 << 14,
    'MessageContent' = 1 << 15,
    'GuildScheduledEvents'  = 1 << 16,
    'AutoModerationConfiguration' = 1 << 20,
    'AutoModerationExecution' = 1 << 21,
    'All' = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512  | 1024 | 2048 | 4096 | 8192 | 16384 | 32768 | 65536 | 1048576 | 2097152

}



interface AppOptions {
    intents?: AppIntents.All | Array<AppIntents>
}

export { AppIntents, AppOptions };