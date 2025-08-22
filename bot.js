const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message, Partials.Channel, Partials.Reaction
    ], });

client.once(Events.ClientReady, async readyClient => {
    console.log(`Connected as ${readyClient.user.tag}!`);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name !== '📝') return;

    try {
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        const quote = reaction.message;
        await quote.channel.send(`${quote.content}`)
    } catch (error) {
        console.error(error);
}})

client.login(token);
