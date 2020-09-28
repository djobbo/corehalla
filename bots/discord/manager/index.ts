import { Client } from 'discord.js';

const client = new Client();

const TOKEN = process.env.DISCORD_TOKEN;

client.login(TOKEN);
