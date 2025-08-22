const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
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
        const canvas = createCanvas(800, 400); // size
        const img = canvas.getContext('2d');
        img.fillStyle = '#d9d9d9'; // background
        img.fillRect(0, 0, canvas.width, canvas.height); // size
        img.fillStyle = '#000000'; // text colour
        img.font = '25px sans-serif'; // text font
        img.fillText(quote.content, 20, 100); // text location
        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: `quote-${Date.now()}-${quote.guildId}.png` });
        await quote.channel.send({ files: [attachment] });
    } catch (error) {
        console.error(error);
}})

client.login(token);
