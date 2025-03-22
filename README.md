# Discord Code Obfuscator Bot

Ein Discord-Bot, der Code in verschiedenen Programmiersprachen verschlüsselt.

## Unterstützte Sprachen
- JavaScript/JS (.js)
- CSS (.css)
- HTML (.html, .htm)
- Lua (.lua)

## Systemanforderungen
- Node.js Version 16.9.0 oder höher
- Discord.js v14
- npm oder yarn

## Installation

1. Installieren Sie Node.js (mindestens Version 16.9.0)
2. Klonen Sie dieses Repository
3. Führen Sie `npm install` aus, um die Abhängigkeiten zu installieren
4. Konfigurieren Sie den Bot in der `config.json`:
   - Fügen Sie Ihren Discord Bot Token ein
   - Fügen Sie die erlaubten Kanal-IDs hinzu
   - Optional: Passen Sie die Einstellungen an
5. Starten Sie den Bot mit `npm start`

## Konfiguration

Die `config.json` enthält folgende Einstellungen:

```json
{
    "token": "IHR_DISCORD_BOT_TOKEN",
    "allowedChannels": [
        "CHANNEL_ID_1",
        "CHANNEL_ID_2"
    ],
    "settings": {
        "timeout": 30000,
        "tempDir": "temp"
    }
}
```

### Einstellungen im Detail:
- `token`: Ihr Discord Bot Token
- `allowedChannels`: Array von Kanal-IDs, in denen der Bot aktiv sein soll
- `settings.timeout`: Maximale Wartezeit für Benutzereingaben in Millisekunden (Standard: 30000)
- `settings.tempDir`: Verzeichnis für temporäre Dateien (Standard: "temp")

### Wie finde ich die Kanal-ID?
1. Aktivieren Sie den Entwicklermodus in Discord (Einstellungen > App-Einstellungen > Erweitert > Entwicklermodus)
2. Rechtsklick auf den gewünschten Kanal
3. Wählen Sie "ID kopieren"

## Verwendung

Sie haben mehrere Möglichkeiten, Code zu verschlüsseln:

### Option 1: Direkte Sprachbefehle
1. Geben Sie einen der folgenden Befehle in einen erlaubten Discord-Kanal ein:
   - `!js` oder `!javascript` für JavaScript
   - `!css` für CSS
   - `!html` für HTML
   - `!lua` für Lua
2. Laden Sie eine Datei hoch oder fügen Sie den Code ein
3. Der Bot wird Ihnen die verschlüsselte Datei zurückgeben

### Option 2: Universeller Befehl
1. Geben Sie `!obfuscator` in einen erlaubten Discord-Kanal ein
2. Wählen Sie die gewünschte Programmiersprache
3. Laden Sie eine Datei hoch oder fügen Sie den Code ein
4. Der Bot wird Ihnen die verschlüsselte Datei zurückgeben

## Features
- Unterstützung für Datei-Uploads
- Automatische Spracherkennung anhand der Dateiendung
- Verbesserte Fehlerbehandlung
- Keine automatischen Erwähnungen in Antworten
- Temporäre Dateien werden automatisch gelöscht
- Detaillierte Fehlerprotokolle

## Hinweise
- Der Bot reagiert nur in den konfigurierten Kanälen
- Die Wartezeit für Eingaben kann in der config.json angepasst werden
- Bei ungültiger Syntax oder Fehlern wird eine Fehlermeldung angezeigt
- Die verschlüsselte Datei wird automatisch mit der korrekten Dateiendung zurückgegeben
- Unterstützte Dateiendungen: .js, .css, .html, .htm, .lua
- Der Bot verwendet die neuesten Discord.js Features und Best Practices

## Support
Bei Fragen oder Problemen können Sie mich auf Discord kontaktieren:
- Discord Name: luke.official
- Support Server: [Discord Server](https://discord.gg/kXf3G9DMPt) 
