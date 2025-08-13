import { Client, GatewayIntentBits, TextChannel, Events } from 'discord.js';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.DISCORD_TOKEN, process.env.NASA_API_KEY);

const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const NASA_API_KEY = process.env.NASA_API_KEY!;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Store channels where the bot should send APOD
const apodChannels = new Set<string>();

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

async function sendApodToChannels() {
  const data = await fetchApod();
  if (!data) return;

  // Create the message content
  const message = `**${data.title}**\n${data.explanation}\n${data.url}`;

  // Send to all registered channels
  for (const channelId of apodChannels) {
    try {
      const channel = client.channels.cache.get(channelId) as TextChannel | undefined;
      if (!channel) {
        console.error(`Canal ${channelId} não encontrado.`);
        apodChannels.delete(channelId);
        continue;
      }

      const channelName = channel instanceof TextChannel ? channel.name : 'canal desconhecido';
      
      if (data.media_type === 'image') {
        await channel.send({ content: message, files: [data.url] });
        console.log(`Imagem enviada com sucesso para ${channelName}!`);
      } else if (data.media_type === 'video') {
        // For videos, just send the message with the link (no file attachment)
        await channel.send({ content: message });
        console.log(`Vídeo enviado com sucesso para ${channelName}!`);
      } else {
        // For other media types, just send the message
        await channel.send({ content: message });
        console.log(`Conteúdo enviado com sucesso para ${channelName}!`);
      }
    } catch (error) {
      console.error(`Erro ao enviar mensagem para ${channelId}:`, error);
      // Remove channel if bot doesn't have permission
      apodChannels.delete(channelId);
    }
  }
}

// Command to register a channel for APOD
client.on(Events.MessageCreate, async (message) => {
  console.log(`Message received: "${message.content}" from ${message.author.tag}`);
  if (message.author.bot) return;
  
  if (message.content === '!apod setup') {
    // Check if user has permission to manage the channel
    if (!message.member?.permissions.has('ManageChannels')) {
      await message.reply('Você precisa ter permissão para gerenciar canais para configurar o APOD.');
      return;
    }

    const channelId = message.channel.id;
    apodChannels.add(channelId);
    await message.reply(`✅ Canal configurado para receber APOD diário! O bot enviará a imagem/vídeo do dia todos os dias às 10:00.`);
    const channelName = message.channel instanceof TextChannel ? message.channel.name : 'canal desconhecido';
    console.log(`Canal ${channelName} (${channelId}) registrado para APOD.`);
  }
  
  if (message.content === '!apod remove') {
    if (!message.member?.permissions.has('ManageChannels')) {
      await message.reply('Você precisa ter permissão para gerenciar canais para remover o APOD.');
      return;
    }

    const channelId = message.channel.id;
    if (apodChannels.has(channelId)) {
      apodChannels.delete(channelId);
      await message.reply('❌ Canal removido da lista de APOD.');
      const channelName = message.channel instanceof TextChannel ? message.channel.name : 'canal desconhecido';
      console.log(`Canal ${channelName} (${channelId}) removido do APOD.`);
    } else {
      await message.reply('Este canal não está configurado para APOD.');
    }
  }

  if (message.content === '!apod test') {
    await message.reply('Testando envio de APOD...');
    await sendApodToChannels();
  }

  if (message.content === '!apod send') {
    await message.reply('Enviando APOD agora...');
    await sendApodToChannels();
  }

  if (message.content === '!apod status') {
    const channelCount = apodChannels.size;
    const channelList = Array.from(apodChannels).map(id => {
      const channel = client.channels.cache.get(id);
      const channelName = channel && 'name' in channel ? channel.name : 'Canal desconhecido';
      return `- ${channelName} (${id})`;
    }).join('\n');
    
    await message.reply(`**Status do APOD:**\nCanais configurados: ${channelCount}\n${channelList || 'Nenhum canal configurado.'}`);
  }
});

client.once('ready', () => {
  console.log(`Bot online como ${client.user?.tag}`);
  console.log(`Bot está em ${client.guilds.cache.size} servidores`);

  // Schedule daily APOD at 10:00 AM
  cron.schedule('0 10 * * *', () => {
    console.log('Enviando APOD...');
    sendApodToChannels();
  });

  // Send APOD immediately when bot starts
  console.log('Enviando APOD imediatamente...');
  sendApodToChannels();
});

client.login(DISCORD_TOKEN);