import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.DISCORD_TOKEN, process.env.NASA_API_KEY, process.env.CHANNEL_ID);

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

  const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel | undefined;
  if (!channel) {
    console.error('Canal não encontrado e/ou bot sem acesso ao canal.');
    return;
  }

  const message = `**${data.title}**\n${data.explanation}\n${data.url}`;

  try {
    if (data.media_type === 'image') {
      await channel.send({ content: message, files: [data.url] });
      console.log('Imagem enviada com sucesso!');
    } else {
    await channel.send({ content: message });
    console.log('Vídeo enviado com sucesso!');
  }
} catch (error) {
    console.error('Erro ao enviar mensagem:', error);
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