const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const JavaScriptObfuscator = require('javascript-obfuscator');
const cssnano = require('cssnano');
const { minify } = require('html-minifier-terser');
const luamin = require('luamin');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Lade die Konfiguration
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.GuildMember
    ]
});

const SUPPORTED_LANGUAGES = {
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'css': 'CSS',
    'html': 'HTML',
    'lua': 'Lua'
};

const FILE_EXTENSIONS = {
    'javascript': ['.js'],
    'js': ['.js'],
    'css': ['.css'],
    'html': ['.html', '.htm'],
    'lua': ['.lua']
};

client.once(Events.ClientReady, () => {
    console.log(`Bot ist online als ${client.user.tag}!`);
    console.log(`Erlaubte Kanäle: ${config.allowedChannels.join(', ')}`);
    console.log(`Node.js Version: ${process.version}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    // Prüfe, ob der Kanal erlaubt ist
    if (!config.allowedChannels.includes(message.channel.id)) {
        return;
    }

    const command = message.content.toLowerCase();
    
    // Prüfe auf direkte Sprachbefehle
    if (command === '!js' || command === '!javascript') {
        await handleLanguageCommand(message, 'javascript');
    } else if (command === '!css') {
        await handleLanguageCommand(message, 'css');
    } else if (command === '!html') {
        await handleLanguageCommand(message, 'html');
    } else if (command === '!lua') {
        await handleLanguageCommand(message, 'lua');
    } else if (command === '!obfuscator') {
        const languageList = Object.entries(SUPPORTED_LANGUAGES)
            .map(([key, value]) => `${key} - ${value}`)
            .join('\n');
        
        await message.reply({
            content: `Bitte wählen Sie eine Programmiersprache:\n${languageList}\n\nAntworten Sie mit der gewünschten Sprache (z.B. "javascript") oder laden Sie eine Datei hoch.`,
            allowedMentions: { repliedUser: false }
        });
        
        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ 
            filter, 
            time: config.settings.timeout, 
            max: 1,
            errors: ['time']
        });

        collector.on('collect', async m => {
            let language;
            let codeContent;

            if (m.attachments.size > 0) {
                const attachment = m.attachments.first();
                const fileExtension = path.extname(attachment.name).toLowerCase();
                
                language = Object.entries(FILE_EXTENSIONS).find(([_, extensions]) => 
                    extensions.includes(fileExtension)
                )?.[0];

                if (!language) {
                    await message.reply({
                        content: 'Ungültiges Dateiformat. Bitte laden Sie eine Datei mit einer der unterstützten Erweiterungen hoch (.js, .css, .html, .lua)',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }

                try {
                    const response = await fetch(attachment.url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    codeContent = await response.text();
                } catch (error) {
                    console.error('Fehler beim Lesen der Datei:', error);
                    await message.reply({
                        content: 'Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }
            } else {
                language = m.content.toLowerCase();
                if (!SUPPORTED_LANGUAGES[language]) {
                    await message.reply({
                        content: 'Ungültige Sprache ausgewählt. Bitte wählen Sie eine der aufgelisteten Sprachen oder laden Sie eine Datei hoch.',
                        allowedMentions: { repliedUser: false }
                    });
                    return;
                }

                await message.reply({
                    content: 'Bitte fügen Sie jetzt den Code ein oder laden Sie eine Datei hoch:',
                    allowedMentions: { repliedUser: false }
                });
                
                const codeCollector = message.channel.createMessageCollector({ 
                    filter, 
                    time: config.settings.timeout, 
                    max: 1,
                    errors: ['time']
                });
                
                const codeMessage = await new Promise((resolve, reject) => {
                    codeCollector.on('collect', async (msg) => {
                        if (msg.attachments.size > 0) {
                            const attachment = msg.attachments.first();
                            const fileExtension = path.extname(attachment.name).toLowerCase();
                            const fileLanguage = Object.entries(FILE_EXTENSIONS).find(([_, extensions]) => 
                                extensions.includes(fileExtension)
                            )?.[0];

                            if (fileLanguage && fileLanguage !== language) {
                                await message.reply({
                                    content: 'Die Dateiendung stimmt nicht mit der gewählten Sprache überein. Bitte versuchen Sie es erneut.',
                                    allowedMentions: { repliedUser: false }
                                });
                                reject(new Error('Ungültige Dateiendung'));
                                return;
                            }

                            try {
                                const response = await fetch(attachment.url);
                                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                                codeContent = await response.text();
                                resolve({ content: codeContent });
                            } catch (error) {
                                console.error('Fehler beim Lesen der Datei:', error);
                                await message.reply({
                                    content: 'Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.',
                                    allowedMentions: { repliedUser: false }
                                });
                                reject(error);
                            }
                        } else {
                            resolve({ content: msg.content });
                        }
                    });

                    codeCollector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            message.reply({
                                content: 'Zeit abgelaufen. Bitte starten Sie den Prozess neu.',
                                allowedMentions: { repliedUser: false }
                            });
                            reject(new Error('Timeout'));
                        }
                    });
                });

                codeContent = codeMessage.content;
            }

            await processCode(message, language, codeContent);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.reply({
                    content: 'Zeit abgelaufen. Bitte starten Sie den Prozess neu.',
                    allowedMentions: { repliedUser: false }
                });
            }
        });
    }
});

async function handleLanguageCommand(message, language) {
    await message.reply({
        content: `Bitte laden Sie eine ${SUPPORTED_LANGUAGES[language]}-Datei hoch oder fügen Sie den Code ein:`,
        allowedMentions: { repliedUser: false }
    });

    const filter = m => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ 
        filter, 
        time: config.settings.timeout, 
        max: 1,
        errors: ['time']
    });

    collector.on('collect', async m => {
        let codeContent;

        if (m.attachments.size > 0) {
            const attachment = m.attachments.first();
            const fileExtension = path.extname(attachment.name).toLowerCase();
            const fileLanguage = Object.entries(FILE_EXTENSIONS).find(([_, extensions]) => 
                extensions.includes(fileExtension)
            )?.[0];

            if (fileLanguage && fileLanguage !== language) {
                await message.reply({
                    content: `Bitte laden Sie eine ${SUPPORTED_LANGUAGES[language]}-Datei hoch.`,
                    allowedMentions: { repliedUser: false }
                });
                return;
            }

            try {
                const response = await fetch(attachment.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                codeContent = await response.text();
            } catch (error) {
                console.error('Fehler beim Lesen der Datei:', error);
                await message.reply({
                    content: 'Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.',
                    allowedMentions: { repliedUser: false }
                });
                return;
            }
        } else {
            codeContent = m.content;
        }

        await processCode(message, language, codeContent);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            message.reply({
                content: 'Zeit abgelaufen. Bitte starten Sie den Prozess neu.',
                allowedMentions: { repliedUser: false }
            });
        }
    });
}

async function processCode(message, language, codeContent) {
    try {
        let obfuscatedCode;
        
        switch (language) {
            case 'javascript':
            case 'js':
                obfuscatedCode = JavaScriptObfuscator.obfuscate(
                    codeContent,
                    {
                        compact: true,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 0.75,
                        deadCodeInjection: true,
                        deadCodeInjectionThreshold: 0.4,
                        debugProtection: true,
                        debugProtectionInterval: true,
                        disableConsoleOutput: true,
                        identifierNamesGenerator: 'hexadecimal',
                        log: false,
                        numbersToExpressions: true,
                        renameGlobals: false,
                        rotateStringArray: true,
                        selfDefending: true,
                        shuffleStringArray: true,
                        splitStrings: true,
                        splitStringsChunkLength: 10,
                        stringArray: true,
                        stringArrayEncoding: ['base64'],
                        stringArrayThreshold: 0.75,
                        transformObjectKeys: true,
                        unicodeEscapeSequence: false
                    }
                ).getObfuscatedCode();
                break;
                
            case 'css':
                try {
                    const result = await cssnano.process(codeContent, {
                        preset: ['default', {
                            discardComments: {
                                removeAll: true,
                                removeAllButFirst: false
                            },
                            normalizeWhitespace: true,
                            minifyFontValues: true,
                            minifyGradients: true,
                            minifyParams: true,
                            minifySelectors: true,
                            mergeLonghand: true,
                            mergeRules: true,
                            reduceInitial: true,
                            reduceTransforms: true,
                            uniqueSelectors: true,
                            zindex: false
                        }]
                    });
                    obfuscatedCode = result.css;
                } catch (error) {
                    console.error('CSS-Verarbeitungsfehler:', error);
                    throw error;
                }
                break;
                
            case 'html':
                obfuscatedCode = await minify(codeContent, {
                    collapseWhitespace: true,
                    minifyJS: true,
                    minifyCSS: true,
                    removeComments: true,
                    removeRedundantAttributes: true
                });
                break;

            case 'lua':
                try {
                    // Minifiziere den Lua-Code
                    obfuscatedCode = luamin.minify(codeContent);
                    
                    // Zusätzliche Obfuskierung durch Variablenumbenennung
                    const varNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
                    let varCounter = 0;
                    
                    // Ersetze lokale Variablen
                    obfuscatedCode = obfuscatedCode.replace(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
                        if (varName !== 'self' && varName !== 'arg') {
                            return `local ${varNames[varCounter++ % varNames.length]}`;
                        }
                        return match;
                    });
                    
                    // Entferne Kommentare
                    obfuscatedCode = obfuscatedCode.replace(/--.*$/gm, '');
                    
                    // Entferne Leerzeilen
                    obfuscatedCode = obfuscatedCode.replace(/^\s*[\r\n]/gm, '');
                } catch (error) {
                    console.error('Lua-Verarbeitungsfehler:', error);
                    throw error;
                }
                break;
        }

        // Erstelle eine temporäre Datei für den verschlüsselten Code
        const tempDir = path.join(__dirname, config.settings.tempDir);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `obfuscated_${Date.now()}${FILE_EXTENSIONS[language][0]}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, obfuscatedCode);

        // Sende die verschlüsselte Datei
        await message.reply({
            content: 'Hier ist Ihre verschlüsselte Datei:',
            files: [filePath],
            allowedMentions: { repliedUser: false }
        });

        // Lösche die temporäre Datei
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Fehler beim Verschlüsseln:', error);
        await message.reply({
            content: 'Es gab einen Fehler beim Verschlüsseln des Codes. Bitte überprüfen Sie die Syntax und versuchen Sie es erneut.',
            allowedMentions: { repliedUser: false }
        });
    }
}

// Verwende den Token aus der Konfiguration
client.login(config.token); 