# 🚀 Despliegue Rápido en Subdominio

## Opciones de Despliegue

### 1️⃣ Docker (Más Simple)

#### En tu servidor:

```bash
# Clona o sube el código
git clone <tu-repo> /var/www/tu-app
cd /var/www/tu-app

# Edita el dominio en deploy.sh
nano deploy.sh
# Cambia: SUBDOMAIN="tu-subdominio" y DOMAIN="tu-dominio.com"

# Ejecuta el script
./deploy.sh
```

#### En tu proveedor de dominios:

Crea un registro A:
```
Tipo: A
Nombre: tu-subdominio
Valor: IP_DE_TU_VPS
TTL: 300
```

---

### 2️⃣ VPS con NGINX (Más Control)

#### Paso 1: Instala dependencias

```bash
# Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20

# Bun
curl -fsSL https://bun.sh/install | bash

# PM2
npm install -g pm2

# NGINX
sudo apt install nginx -y
```

#### Paso 2: Build local

```bash
cd /home/z/my-project

# Crea .production.env
cat > .production.env << 'EOF'
DATABASE_URL="file:./db/production.db"
NODE_ENV="production"
EOF

# Build
bun run build

# Empaqueta
tar -czf app.tar.gz .next/ package.json prisma/ public/ .production.env
```

#### Paso 3: Sube al servidor

```bash
# Sube
scp app.tar.gz usuario@tu-servidor.com:/var/www/tu-app/

# En el servidor
ssh usuario@tu-servidor.com
cd /var/www/tu-app
tar -xzf app.tar.gz
bun install --production
bun run db:generate
bun run db:push
cp .production.env .env
```

#### Paso 4: PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### Paso 5: NGINX

```bash
# Crea configuración
sudo nano /etc/nginx/sites-available/tu-subdominio.tu-dominio.com
```

Pega el contenido de `DEPLOYMENT.md`

```bash
# Habilita
sudo ln -s /etc/nginx/sites-available/tu-subdominio.tu-dominio.com \
  /etc/nginx/sites-enabled/

# Recarga
sudo nginx -t && sudo systemctl reload nginx
```

---

### 3️⃣ Vercel (Cloud - Más Fácil)

```bash
# Instala CLI
npm i -g vercel

# Despliega
vercel

# Agrega dominio
vercel domains add tu-subdominio.tu-dominio.com
```

Vercel crea automáticamente el subdominio.

---

## SSL con Let's Encrypt (VPS/NGINX)

```bash
# Instala Certbot
sudo apt install certbot python3-certbot-nginx -y

# Genera certificado
sudo certbot --nginx -d tu-subdominio.tu-dominio.com

# Certbot configura NGINX automáticamente
```

Renovación automática:
```bash
sudo crontab -e
# Agrega: 0 0 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

---

## Verificar Despliegue

### Verificar DNS:
```bash
# En tu máquina local
dig tu-subdominio.tu-dominio.com
```

### Verificar que la app corre:
```bash
# En el servidor
pm2 status
curl http://localhost:3000
```

### Ver logs:
```bash
# PM2
pm2 logs gestion-proyectos

# NGINX
sudo tail -f /var/log/nginx/tu-subdominio-access.log
```

---

## Comandos Útiles

### PM2
```bash
pm2 status              # Ver estado
pm2 logs                # Ver logs
pm2 restart all         # Reiniciar
pm2 stop all            # Detener
pm2 monit               # Monitoreo interactivo
```

### Docker
```bash
docker-compose ps         # Ver contenedores
docker-compose logs -f   # Ver logs
docker-compose restart    # Reiniciar
docker-compose down      # Detener
docker-compose up -d     # Iniciar
```

### NGINX
```bash
sudo nginx -t           # Test configuración
sudo systemctl reload nginx   # Recargar
sudo systemctl restart nginx  # Reiniciar
```

---

## Troubleshooting

### 502 Bad Gateway:
- Verifica que la app corre en puerto 3000
- Verifica PM2: `pm2 status`

### Certificados SSL:
- Verifica: `sudo certbot certificates`
- Renueva: `sudo certbot renew`

### Build errors:
- Limpia: `rm -rf .next`
- Rebuild: `bun run build`

---

## Documentación Completa

Para más detalles, ver: [DEPLOYMENT.md](./DEPLOYMENT.md)
