const { Client, GatewayIntentBits, PermissionFlagsBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = 'Tokenınızı girin.';
const PREFIX = '!'; 

client.on('ready', () => {
    console.log(`${client.user.tag} aktif! Durum döngüsü başlatıldı.`);

    // --- DURUM DÖNGÜSÜ AYARI ---
    const durumlar = [
        'DURUM 1',
        'DURUM 2'
    ];
    let i = 0;

    setInterval(() => {
        client.user.setPresence({
            activities: [{ 
                name: durumlar[i], 
                type: ActivityType.Custom 
            }],
            status: 'online',
        });
        
        // i değerini değiştir (0 ise 1 yap, 1 ise 0 yap)
        i = i === durumlar.length - 1 ? 0 : i + 1;
    }, 10000); // 10 saniyede bir durumu değiştirir (İdeal süredir)
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 1. KOMUT: TOPLU ROL VERME
    if (command === 'toplurol') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('Yetkin yok!');
        const role = message.mentions.roles.first();
        if (!role) return message.reply('Bir rol etiketle!');

        const members = await message.guild.members.fetch();
        let sayac = 0;

        message.channel.send('🔄 Roller dağıtılıyor, lütfen bekleyin...');

        for (const [id, member] of members) {
            if (!member.roles.cache.has(role.id) && !member.user.bot) {
                await member.roles.add(role).catch(() => {});
                sayac++;
            }
        }
        message.channel.send(`✅ **${sayac}** kişiye **${role.name}** rolü başarıyla verildi.`);
    }

    // 2. KOMUT: ROL BİLGİ VE EVERYONE
    if (command === 'rolbilgi') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const roles = message.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => `• **${role.name}** — \`${role.members.size} Üye\``)
            .join('\n');

        const mesaj = `### 📊 Sunucu Rol Bilgileri\n${roles}\n\n@everyone`;
        
        if (mesaj.length > 2000) return message.reply('⚠️ Rol sayısı çok fazla olduğu için liste paylaşılamıyor!');
        message.channel.send(mesaj);
    }
});

client.login(TOKEN);