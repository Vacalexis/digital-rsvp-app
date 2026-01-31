#!/usr/bin/env node

/**
 * Script para obter o IP público atual
 * Útil para adicionar à lista de IPs permitidos no Vercel
 * 
 * Uso: node get-my-ip.js
 */

const https = require('https');

function getIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', reject);
  });
}

async function main() {
  console.log('\n🔍 A obter o seu IP público...\n');
  
  try {
    const ip = await getIP();
    
    console.log('✅ Sucesso!\n');
    console.log('═══════════════════════════════════════════');
    console.log(`   Seu IP: ${ip}`);
    console.log('═══════════════════════════════════════════\n');
    console.log('📋 Copie este IP e adicione à variável ALLOWED_IPS no Vercel:\n');
    console.log(`   Vercel Dashboard → Settings → Environment Variables`);
    console.log(`   Nome: ALLOWED_IPS`);
    console.log(`   Valor: ${ip}\n`);
    console.log('💡 Para adicionar múltiplos IPs, separe com vírgulas:');
    console.log(`   ${ip},outro-ip-aqui,mais-um-ip\n`);
    
  } catch (error) {
    console.error('❌ Erro ao obter IP:', error.message);
    console.error('\n💡 Tente manualmente em: https://www.whatismyip.com/\n');
    process.exit(1);
  }
}

main();
