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
    // Caso seja vídeo ou outro tipo, apenas envia o link
    await channel.send(message);
  }
}

client.once('ready', () => {
  console.log(`Bot online como ${client.user?.tag}`);

  // Agendamento: todo dia às 10h da manhã (hora do servidor)
  cron.schedule('0 10 * * *', () => {
    console.log('Enviando APOD...');
    sendApodToChannel();
  });

  // Opcional: enviar logo que o bot iniciar, para teste
  sendApodToChannel();
});

client.login(DISCORD_TOKEN);