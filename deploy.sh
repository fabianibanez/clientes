#!/bin/bash

# Script de despliegue para Docker
# Uso: ./deploy.sh

set -e  # Termina si hay error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
APP_NAME="gestion-proyectos"
SUBDOMAIN="tu-subdominio"
DOMAIN="tu-dominio.com"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Despliegue: ${APP_NAME}${NC}"
echo -e "${GREEN}  Dominio: ${FULL_DOMAIN}${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

# 2. Actualizar dominio en NGINX
echo -e "${YELLOW}📝 Actualizando configuración NGINX...${NC}"
sed -i "s/tu-subdominio.tu-dominio.com/${FULL_DOMAIN}/g" nginx/nginx.conf
echo -e "${GREEN}✅ Configuración actualizada${NC}"
echo ""

# 3. Crear directorios necesarios
echo -e "${YELLOW}📁 Creando directorios...${NC}"
mkdir -p db
mkdir -p uploads
mkdir -p logs/nginx
mkdir -p nginx/ssl
echo -e "${GREEN}✅ Directorios creados${NC}"
echo ""

# 4. Build de la aplicación
echo -e "${YELLOW}🔨 Build de la aplicación...${NC}"
bun run build
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

# 5. Build de Docker
echo -e "${YELLOW}🐳 Build de Docker...${NC}"
docker-compose build
echo -e "${GREEN}✅ Docker build completado${NC}"
echo ""

# 6. Detener contenedores existentes
echo -e "${YELLOW}🛑 Deteniendo contenedores...${NC}"
docker-compose down
echo -e "${GREEN}✅ Contenedores detenidos${NC}"
echo ""

# 7. Iniciar contenedores
echo -e "${YELLOW}🚀 Iniciando contenedores...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Contenedores iniciados${NC}"
echo ""

# 8. Verificar estado
echo -e "${YELLOW}📊 Verificando estado...${NC}"
sleep 5
docker-compose ps
echo ""

# 9. Mostrar logs
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  ✅ Despliegue completado${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${GREEN}🌐 Aplicación disponible en: https://${FULL_DOMAIN}${NC}"
echo ""
echo -e "${YELLOW}Para ver los logs:${NC}"
echo -e "  docker-compose logs -f"
echo ""
echo -e "${YELLOW}Para reiniciar:${NC}"
echo -e "  docker-compose restart"
echo ""
