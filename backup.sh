#!/bin/bash

# Script de backup de base de datos

set -e  # Termina si hay error

# Configuración
APP_NAME="gestion-proyectos"
BACKUP_DIR="/var/backups/${APP_NAME}"
DB_FILE="/var/www/tu-app/db/production.db"
DATE=$(date +%Y%m%d_%H%M%S)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Backup: ${APP_NAME}${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Crear directorio de backups
echo -e "${YELLOW}📁 Creando directorio de backup...${NC}"
mkdir -p $BACKUP_DIR
echo -e "${GREEN}✅ Directorio creado${NC}"

# Backup de la base de datos
echo -e "${YELLOW}💾 Creando backup de la base de datos...${NC}"
if [ -f "$DB_FILE" ]; then
    cp $DB_FILE $BACKUP_DIR/backup_$DATE.db
    echo -e "${GREEN}✅ Backup creado: backup_$DATE.db${NC}"
else
    echo -e "${RED}❌ Archivo de base de datos no encontrado: $DB_FILE${NC}"
    exit 1
fi

# Comprimir
echo -e "${YELLOW}🗜️  Comprimiendo backup...${NC}"
gzip $BACKUP_DIR/backup_$DATE.db
echo -e "${GREEN}✅ Backup comprimido: backup_$DATE.db.gz${NC}"

# Tamaño del backup
BACKUP_SIZE=$(du -h $BACKUP_DIR/backup_$DATE.db.gz | cut -f1)
echo -e "${GREEN}📊 Tamaño del backup: $BACKUP_SIZE${NC}"

# Eliminar backups antiguos (más de 7 días)
echo -e "${YELLOW}🧹 Limpiando backups antiguos...${NC}"
DELETED=$(find $BACKUP_DIR -name "backup_*.db.gz" -mtime +7 -delete -print | wc -l)
echo -e "${GREEN}✅ Eliminados $DELETED backups antiguos${NC}"

# Listar backups disponibles
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Backups disponibles:${NC}"
echo -e "${GREEN}======================================${NC}"
ls -lh $BACKUP_DIR/ | tail -n +2 | awk '{print $9, $5}'
echo ""

echo -e "${GREEN}✅ Backup completado${NC}"
echo ""
