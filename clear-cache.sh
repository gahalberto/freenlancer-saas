#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando limpeza completa de cache...${NC}"

# Parar processos Next.js em execução
echo -e "${GREEN}Parando processos Next.js...${NC}"
pkill -f "next" || true

# Remover diretório .next
echo -e "${GREEN}Removendo diretório .next...${NC}"
rm -rf .next

# Limpar cache do npm
echo -e "${GREEN}Limpando cache do npm...${NC}"
npm cache clean --force

# Remover node_modules (opcional - descomente se necessário)
# echo -e "${GREEN}Removendo node_modules...${NC}"
# rm -rf node_modules

# Reinstalar dependências (opcional - descomente se removeu node_modules)
# echo -e "${GREEN}Reinstalando dependências...${NC}"
# npm install

# Reconstruir o projeto
echo -e "${GREEN}Reconstruindo o projeto...${NC}"
npm run build

echo -e "${YELLOW}Cache limpo com sucesso!${NC}"
echo -e "${GREEN}Para iniciar o servidor de desenvolvimento, execute:${NC}"
echo -e "${YELLOW}npm run dev${NC}" 