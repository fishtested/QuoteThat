const { Client, Events, GatewayIntentBits, AttachmentBuilder, Partials, SlashCommandBuilder } = require('discord.js');
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
    await registerCommand();
    console.log(`Connected as ${readyClient.user.tag}!`);
});

async function registerCommand() {
const commands = [
    new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Generates a quote graphic')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('What?')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Who?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('date')
                .setDescription('When?')
                .setRequired(true)
                .addChoices(
                    { name: 'Today', value: 'today' },
                    { name: 'This month', value: 'thisMonth' },
                    { name: 'This year', value: 'thisYear' },
                )
        )
].map(cmd => cmd.toJSON());

try {
    await client.application.commands.set(commands);
    console.log('Commands registered');
} catch (error) {
    console.error('Error registering commands:', error);
}
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    let dateType;

    if (commandName === 'quote') {
        await interaction.reply({ content: "Generating...", ephemeral: true });
        const text = interaction.options.getString('text');
        const user = interaction.options.getUser('user');
        let date = interaction.options.getString('date');

        if (date === 'today') {
            dateType = 'full';
            date = new Date();
        } else if (date === 'thisMonth') {
            dateType = 'month';
            date = new Date();
        } else if (date === 'thisYear') {
            dateType = 'year';
            date = new Date();
        }

        const attachment = await generate({
            text,
            authorName: user.username, 
            displayName: interaction.guild.members.cache.get(user.id)?.displayName || user.username,
            date,
            messageId: Date.now(),
            channel: interaction.channel,
            dateType
        });

        await interaction.editReply({
            files: [attachment],
            ephemeral: false
        });
    }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        if (reaction.emoji.name !== '📝') return;
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const message = reaction.message;
        if (message.author.bot) return;
        let dateType = 'full';
        await generate({
            text: message.content,
            authorName: message.author.username,
            displayName: message.member?.displayName || message.author.username,
            date: message.createdAt,
            channel: message.channel,
            messageId: message.id,
            dateType
        });
    } catch (err) {
        console.error('Reaction error:', err);
    }
});


async function generate({ text, authorName, displayName, date, channel, messageId, dateType }) {
    const backgroundnum = Math.floor(Math.random() * 3 + 1);
    const backgroundImage = await loadImage(__dirname + `/backgrounds/${backgroundnum}.jpg`);

    try {
        console.log(`quoting!`);
        console.time(`quoteImage-${messageId}`);
        const canvas = createCanvas(800, 450); // size
        const img = canvas.getContext('2d');
        let quoteDate;
        img.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        img.fillStyle = '#000000'; // text colour
        let fontSize = 25; // main quote font size
        img.font = `${fontSize}px sans-serif`;
        img.textAlign = 'center';
        let infoSize = 20;
        const maxWidth = canvas.width - 40;
        const words = text.split(' ');
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

        let d = new Date(date);
        let monthnum = d.getMonth();
        let year = d.getFullYear();
        let day = d.getDate();
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
        if (dateType === 'full') {
            quoteDate = `${month} ${day}, ${year}`;
        } else if (dateType === 'month') {
            quoteDate = `${month} ${year}`;
        } else if (dateType === 'year') {
            quoteDate = `${year}`;
        }

        let bottomText = `${displayName} (${authorName}) - ${quoteDate}`;

        do {
            img.font = `${infoSize}px sans-serif`;
            infoSize--;
        } while (img.measureText(bottomText).width > canvas.width - 40 && infoSize > 10);
        img.textAlign = 'left';
        img.fillText(bottomText, 20, 430);

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: `quote-${Date.now()}-${messageId}.png` });
        await channel.send({ files: [attachment] });
        console.timeEnd(`quoteImage-${messageId}`);
        console.log(`quoted!`);
    } catch (error) {
        console.error(error);
}}

client.login(token);
