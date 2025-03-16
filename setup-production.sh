#!/bin/bash

# Script para configurar o ambiente de produção

echo "Instalando dependências..."
npm install

echo "Instalando sharp para otimização de imagens..."
npm install sharp --save

echo "Limpando cache do Next.js..."
rm -rf .next

echo "Construindo o aplicativo..."
NODE_ENV=production npm run build

echo "Parando o serviço PM2 existente (se houver)..."
pm2 stop freenlancer-saas || true
pm2 delete freenlancer-saas || true

echo "Iniciando o aplicativo com PM2..."
pm2 start ecosystem.config.js

echo "Salvando configuração do PM2..."
pm2 save

echo "Configuração concluída! Verifique os logs com: pm2 logs freenlancer-saas" 