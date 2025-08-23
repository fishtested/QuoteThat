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
        img.textAlign = 'center';
        img.fillText(quote.content, canvas.width / 2, 40); // text location
        img.textAlign = 'left';

        let date = quote.createdAt;
        let monthnum = date.getMonth();
        let year = date.getFullYear();
        let day = date.getDate();
        let month

        if (monthnum === 0) {
            month = 'January';
        } else if (monthnum === 1) {
            month = 'February';
        } else if (monthnum === 2) {
            month = 'March';
        } else if (monthnum === 3) {
            month = 'April';
        } else if (monthnum === 4) {
            month = 'May';
        } else if (monthnum === 5) {
            month = 'June';
        } else if (monthnum === 6) {
            month = 'July';
        } else if (monthnum === 7) {
            month = 'August';
        } else if (monthnum === 8) {
            month = 'September';
        } else if (monthnum === 9) {
            month = 'October';
        } else if (monthnum === 10) {
            month = 'November';
        } else if (monthnum === 11) {
            month = 'December';
        }


        img.fillText(`${quote.member.displayName} - ${month} ${day}, ${year}`, 20, 380);
        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: `quote-${Date.now()}-${quote.guildId}.png` });
        await quote.channel.send({ files: [attachment] });
    } catch (error) {
        console.error(error);
}})

client.login(token);
