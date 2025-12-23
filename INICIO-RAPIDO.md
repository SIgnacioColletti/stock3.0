# 🚀 Guía de Inicio Rápido - E-commerce Admin

## 📦 Instalación en 5 pasos

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Configurar variables de entorno
```bash
cp .env.example .env
# Edita el archivo .env con tus credenciales
```

**Variables requeridas:**
- `DATABASE_URL`: Tu conexión PostgreSQL
- `NEXTAUTH_SECRET`: Genera con `openssl rand -base64 32`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Tu cloud name de Cloudinary
- `CLOUDINARY_API_KEY`: Tu API key de Cloudinary
- `CLOUDINARY_API_SECRET`: Tu API secret de Cloudinary

### 3️⃣ Configurar base de datos
```bash
npm run db:push
npm run seed
```

### 4️⃣ Iniciar servidor
```bash
npm run dev
```

### 5️⃣ Acceder
Abre: http://localhost:3000

**Credenciales:**
- Email: `admin@tienda.com`
- Password: `admin123`

---

## 🎯 Primeros pasos después de instalar

1. **Login** con las credenciales de arriba
2. **Ve a Configuración** y personaliza:
   - Nombre de tu tienda
   - Logo
   - Colores de marca
   - Moneda y región
3. **Crea categorías** en "Categorías"
4. **Agrega productos** en "Productos"

---

## 📋 Scripts útiles

```bash
npm run dev          # Desarrollo
npm run build        # Producción
npm run db:push      # Sincronizar DB
npm run db:studio    # Ver DB en GUI
npm run seed         # Ejecutar seed
npm run db:reset     # Resetear DB
```

---

## 🔧 Configurar PostgreSQL

**Si no tienes PostgreSQL instalado:**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Crear base de datos:**
```bash
sudo -u postgres psql
CREATE DATABASE ecommerce_db;
CREATE USER admin WITH PASSWORD 'admin123';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO admin;
\q
```

**Tu DATABASE_URL será:**
```
postgresql://admin:admin123@localhost:5432/ecommerce_db
```

---

## ☁️ Configurar Cloudinary

1. Regístrate gratis en: https://cloudinary.com
2. Ve a tu Dashboard
3. Copia:
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## 🐛 Problemas comunes

**Error: "Can't connect to database"**
```bash
# Verifica que PostgreSQL esté corriendo
sudo systemctl status postgresql
# Si está detenido, inícialo
sudo systemctl start postgresql
```

**Error: "NEXTAUTH_SECRET is not defined"**
```bash
# Genera un secret
openssl rand -base64 32
# Agrégalo al .env
```

**Error: "Cloudinary upload failed"**
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de no tener espacios en el Cloud Name

---

## 📚 Documentación completa

Lee el archivo `README.md` para:
- Arquitectura del proyecto
- Funcionalidades detalladas
- Deploy a producción
- Personalización avanzada
- Troubleshooting completo

---

## ✅ Checklist de instalación

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado y corriendo
- [ ] Cuenta de Cloudinary creada
- [ ] `npm install` ejecutado
- [ ] `.env` configurado
- [ ] `npm run db:push` ejecutado
- [ ] `npm run seed` ejecutado
- [ ] `npm run dev` funcionando
- [ ] Login exitoso con admin@tienda.com

---

**¡Todo listo! Ahora puedes empezar a construir tu tienda 🎉**
