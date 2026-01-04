# 🚀 Guía de Despliegue - Gestión de Proyectos

## 📋 Índice

1. [Prerrequisitos](#prerrequisitos)
2. [Opción 1: VPS Propio con NGINX](#opción-1-vps-propio-con-nginx)
3. [Opción 2: Docker](#opción-2-docker)
4. [Opción 3: Plataformas Cloud](#opción-3-plataformas-cloud)
5. [Configuración de Subdominio](#configuración-de-subdominio)
6. [SSL/Certificados](#sslcertificados)
7. [Monitoreo y Logs](#monitoreo-y-logs)
8. [Respaldo y Seguridad](#respaldo-y-seguridad)

---

## Prerrequisitos

### Para VPS Propio:
- Ubuntu 20.04+ o Debian 11+
- 2GB RAM mínimo (4GB recomendado)
- 20GB espacio en disco mínimo
- Node.js 20+
- NGINX
- Dominio registrado

### Para Docker:
- Docker 20+
- Docker Compose 2+
- Mismos requisitos de hardware

---

## Opción 1: VPS Propio con NGINX

### Paso 1: Configurar el Servidor

```bash
# Conecta a tu VPS
ssh usuario@tu-servidor.com

# Actualiza el sistema
sudo apt update && sudo apt upgrade -y

# Instala Node.js (usando NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Instala Bun
curl -fsSL https://bun.sh/install | bash

# Instala PM2
npm install -g pm2

# Instala NGINX
sudo apt install nginx -y
```

### Paso 2: Preparar la Aplicación

En tu máquina local:

```bash
# Entra en el proyecto
cd /home/z/my-project

# Crea archivo de producción
cat > .production.env << 'EOF'
DATABASE_URL="file:./db/production.db"
NODE_ENV="production"
EOF

# Build de la aplicación
bun run build

# Empaqueta
tar -czf app.tar.gz \
  .next/ \
  package.json \
  prisma/ \
  public/ \
  .production.env
```

### Paso 3: Subir al Servidor

```bash
# Sube el archivo
scp app.tar.gz usuario@tu-servidor.com:/var/www/tu-app/

# O usa rsync
rsync -avz \
  --exclude 'node_modules' \
  --exclude '.next' \
  . usuario@tu-servidor.com:/var/www/tu-app/
```

### Paso 4: Configurar en el Servidor

```bash
# Conéctate
ssh usuario@tu-servidor.com

# Crea directorio
sudo mkdir -p /var/www/tu-app
sudo chown -R $USER:$USER /var/www/tu-app

# Descomprime
cd /var/www/tu-app
tar -xzf app.tar.gz

# Instala dependencias
bun install --production

# Configura base de datos
bun run db:generate
bun run db:push

# Copia env
cp .production.env .env
```

### Paso 5: PM2 Configuration

```bash
# Crea ecosystem.config.cjs
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'gestion-proyectos',
    script: 'node',
    args: '.next/standalone/server.js',
    cwd: '/var/www/tu-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/error.log',
    out_file: '/var/log/pm2/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Inicia
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Paso 6: Configurar NGINX

```bash
sudo nano /etc/nginx/sites-available/tu-subdominio.tu-dominio.com
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-subdominio.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-subdominio.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Habilitar y recargar:

```bash
sudo ln -s /etc/nginx/sites-available/tu-subdominio.tu-dominio.com \
  /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

---

## Opción 2: Docker

### Paso 1: Actualizar Configuración

Edita `deploy.sh` con tu dominio:

```bash
nano deploy.sh
```

Cambia:
```bash
SUBDOMAIN="tu-subdominio"
DOMAIN="tu-dominio.com"
```

Por tus valores reales.

### Paso 2: Ejecutar Despliegue

```bash
# En el servidor
cd /var/www/tu-app

# Ejecuta el script
./deploy.sh
```

### Paso 3: Configurar Subdominio

En tu proveedor de dominios, crea un registro:

```
Tipo: A
Nombre: tu-subdominio
Valor: IP_DE_TU_VPS
TTL: 300
```

---

## Opción 3: Plataformas Cloud

### Vercel (Recomendado para Next.js)

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Entra en tu proyecto:
```bash
cd /home/z/my-project
```

3. Despliega:
```bash
vercel
```

4. Configura dominio:
```bash
vercel domains add tu-subdominio.tu-dominio.com
```

### Netlify

1. Instala Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Despliega:
```bash
netlify deploy --prod
```

### Railway

1. Instala Railway CLI:
```bash
npm install -g @railway/cli
```

2. Inicia y despliega:
```bash
railway login
railway init
railway up
```

---

## Configuración de Subdominio

### En tu proveedor de DNS (Cloudflare, Namecheap, GoDaddy, etc.)

**Registro A:**
```
Tipo: A
Nombre: tu-subdominio
Valor: IP_DE_TU_VPS
TTL: 3600 (o automático)
Proxy: No (si usas Cloudflare)
```

**Verificar propagación:**
```bash
# Verifica DNS
dig tu-subdominio.tu-dominio.com

# O
nslookup tu-subdominio.tu-dominio.com
```

Tiempo de propagación: 5 minutos a 48 horas

---

## SSL/Certificados

### Let's Encrypt (Gratis)

```bash
# Instala Certbot
sudo apt install certbot python3-certbot-nginx -y

# Genera certificado
sudo certbot --nginx -d tu-subdominio.tu-dominio.com

# Certbot configura NGINX automáticamente
```

### Renovación Automática

```bash
# Verifica configuración
sudo certbot renew --dry-run

# Agrega a cron
sudo crontab -e
```

Agrega:
```cron
0 0 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

---

## Monitoreo y Logs

### PM2

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs gestion-proyectos

# Ver logs en tiempo real
pm2 logs gestion-proyectos --lines 100

# Monitoreo web
pm2 web
```

### NGINX

```bash
# Ver logs
sudo tail -f /var/log/nginx/tu-subdominio-access.log
sudo tail -f /var/log/nginx/tu-subdominio-error.log
```

### Docker

```bash
# Ver contenedores
docker-compose ps

# Ver logs
docker-compose logs -f

# Logs de app específico
docker-compose logs -f app
```

---

## Respaldo y Seguridad

### Respaldo de Base de Datos

```bash
# Crea script de backup
cat > /var/www/tu-app/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/tu-app"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup SQLite
cp /var/www/tu-app/db/production.db \
  $BACKUP_DIR/backup_$DATE.db

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.db

# Elimina backups de más de 7 días
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +7 -delete
EOF

chmod +x /var/www/tu-app/backup.sh

# Agrega a cron (diario a las 3 AM)
crontab -e
```

Agrega:
```cron
0 3 * * * /var/www/tu-app/backup.sh
```

### Firewall

```bash
# Habilita firewall
sudo ufw enable

# Permite SSH
sudo ufw allow ssh

# Permite HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verifica estado
sudo ufw status
```

---

## Troubleshooting

### La aplicación no carga:

```bash
# Verifica PM2
pm2 status

# Verifica NGINX
sudo systemctl status nginx

# Verifica logs
pm2 logs gestion-proyectos
```

### Error 502 Bad Gateway:

```bash
# Verifica que la app corre en puerto 3000
netstat -tlnp | grep 3000

# O
lsof -i :3000
```

### Certificados SSL:

```bash
# Verifica certificado
sudo certbot certificates

# Renueva manualmente
sudo certbot renew
```

---

## Soporte

Para más información, consulta:
- [Next.js Documentation](https://nextjs.org/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start)
- [NGINX Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
