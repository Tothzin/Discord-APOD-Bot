import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const NASA_API_KEY = process.env.NASA_API_KEY!;
const CHANNEL_ID = process.env.CHANNEL_ID!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

async function fetchApod() {
  try {
    const response = await axios.get('https://api.nasa.gov/planetary/apod', {
      params: { api_key: NASA_API_KEY }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar APOD:', error);
    return null;
  }
}

async function sendApodToChannel() {
  const data = await fetchApod();
  if (!data) return;

  const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;
  if (!channel) {
    console.error('Canal não encontrado.');
    return;
  }

  let message = `**${data.title}**\n${data.explanation}\n${data.url}`;

  if (data.media_type === 'image') {
    await channel.send({ content: message, files: [data.url] });
  } else {
    // In case of video, we can just send the message with the URL
    await channel.send(message);
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user?.tag}`);

  // Server time - Schedule
  cron.schedule('0 10 * * *', () => {
    console.log('Seding APOD...');
    sendApodToChannel();
  });

  // As soon as the bot is ready, send the APOD immediately
  console.log('Sending APOD immediately...');
  sendApodToChannel();
});

client.login(DISCORD_TOKEN);