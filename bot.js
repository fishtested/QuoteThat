const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { token } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message, Partials.Channel, Partials.Reaction
    ],
});

client.once(Events.ClientReady, async readyClient => {
    console.log(`Connected as ${readyClient.user.tag}!`);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name !== '📝') return;

    const backgroundnum = Math.floor(Math.random() * 3 + 1);
    const backgroundImage = await loadImage(__dirname + `/backgrounds/${backgroundnum}.jpg`);

    try {
        console.log(`quoting!`);
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        const quote = reaction.message;
        const canvas = createCanvas(800, 450);
        const img = canvas.getContext('2d');
        img.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        img.fillStyle = '#000000'; // text colour
        let fontSize = 25; // main quote font size
        img.font = `${fontSize}px sans-serif`;
        img.textAlign = 'center';
        let infoSize = 20;
        const maxWidth = canvas.width - 40;
        const words = quote.content.split(' ');
        const lines = [];
        let line = '';

        for (const word of words) {
            const testLine = line + word + ' ';
            if (img.measureText(testLine).width > maxWidth) {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        const lineHeight = fontSize * 1.2;
        const textHeight = lines.length * lineHeight;
        let y = (canvas.height - textHeight) / 2 + lineHeight / 2;
        for (const l of lines) {
            img.fillText(l, canvas.width / 2, y);
            y += lineHeight;
        }

        const displayName = quote.member?.displayName ?? quote.author.username;

        let date = quote.createdAt;
        let monthnum = date.getMonth();
        let year = date.getFullYear();
        let day = date.getDate();
        let month;

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

        let bottomText = `${displayName} (${quote.author.username}) - ${month} ${day}, ${year}`;

        do {
            img.font = `${infoSize}px sans-serif`;
            infoSize--;
        } while (img.measureText(bottomText).width > canvas.width - 40 && infoSize > 10);
        img.textAlign = 'left';
        img.fillText(bottomText, 20, 430);

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: `quote-${Date.now()}-${quote.guildId}.png` });
        await quote.channel.send({ files: [attachment] });
        console.log(`quoted!`);
    } catch (error) {
        console.error(error);
}})

client.login(token);
