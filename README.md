# 🛍️ E-commerce Admin - Sistema Genérico de Administración

Sistema completo de administración de e-commerce construido con **Next.js 14**, **TypeScript**, **Prisma**, **PostgreSQL**, **NextAuth**, y **Cloudinary**. 100% genérico y reutilizable para cualquier tipo de producto.

## ✨ Características

- 🔐 **Autenticación segura** con NextAuth y bcrypt
- 📦 **CRUD completo de productos** con imágenes múltiples
- 📁 **Sistema de categorías** flexible
- 🎨 **Paleta de colores configurable** desde el panel admin
- 📸 **Upload de imágenes** a Cloudinary
- 💾 **Atributos dinámicos** en formato JSON para cualquier tipo de producto
- 🎯 **Sistema genérico** adaptable a cualquier rubro (bebidas, ropa, electrónica, etc.)
- 📱 **Diseño responsive** con Tailwind CSS
- ⚡ **Animaciones suaves** y transiciones
- 🔍 **Búsqueda y filtros** de productos
- 📊 **Dashboard** con estadísticas
- 🎨 **UI moderna** con componentes reutilizables

## 🚀 Tecnologías

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **Autenticación:** NextAuth.js
- **Estilos:** Tailwind CSS
- **Imágenes:** Cloudinary
- **Validación:** Zod + React Hook Form
- **Iconos:** Lucide React
- **Notificaciones:** React Hot Toast

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL instalado y corriendo
- Cuenta en Cloudinary (gratuita)
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd ecommerce-admin
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Database - PostgreSQL
DATABASE_URL="postgresql://usuario:password@localhost:5432/ecommerce_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-aleatorio-seguro-aqui"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 📝 Cómo obtener las credenciales:

**PostgreSQL:**
- Crea una base de datos llamada `ecommerce_db`
- Usuario y contraseña según tu instalación local
- Formato: `postgresql://usuario:password@localhost:5432/nombre_db`

**NEXTAUTH_SECRET:**
- Genera uno aleatorio con: `openssl rand -base64 32`
- O usa cualquier string largo y seguro

**Cloudinary:**
1. Regístrate gratis en [cloudinary.com](https://cloudinary.com)
2. Ve a tu Dashboard
3. Copia:
   - Cloud Name
   - API Key
   - API Secret

### 4. Configurar la base de datos

```bash
# Crear las tablas en la base de datos
npm run db:push

# Ejecutar el seed (crear usuario admin y tienda base)
npm run seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciales de Acceso

Después de ejecutar el seed, podrás acceder con:

- **Email:** `admin@tienda.com`
- **Password:** `admin123`

## 📁 Estructura del Proyecto

```
ecommerce-admin/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── seed.ts                # Script de seed inicial
├── src/
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── categories/    # CRUD categorías
│   │   │   ├── products/      # CRUD productos
│   │   │   ├── store/         # Configuración tienda
│   │   │   └── upload/        # Upload imágenes
│   │   ├── dashboard/         # Panel admin
│   │   │   ├── categories/    # Gestión categorías
│   │   │   ├── products/      # Gestión productos
│   │   │   ├── settings/      # Configuración
│   │   │   └── page.tsx       # Dashboard home
│   │   ├── login/             # Página de login
│   │   ├── layout.tsx         # Layout principal
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   └── ui/                # Componentes reutilizables
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── cloudinary.ts      # Utilidades Cloudinary
│   │   ├── prisma.ts          # Cliente Prisma
│   │   └── utils.ts           # Funciones auxiliares
│   └── types/                 # TypeScript types
├── .env.example               # Variables de entorno ejemplo
├── package.json               # Dependencias
└── README.md                  # Este archivo
```

## 🎯 Funcionalidades Principales

### Gestión de Categorías
- ✅ Crear, editar y eliminar categorías
- ✅ Subir imagen para cada categoría
- ✅ Descripción opcional
- ✅ Contador de productos por categoría
- ✅ Validación: no se puede eliminar categoría con productos

### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Múltiples imágenes por producto (hasta 5)
- ✅ Campos de precio, precio comparación, y costo
- ✅ Control de inventario (stock, SKU)
- ✅ Atributos dinámicos ilimitados (JSON)
- ✅ Estados: activo/inactivo, destacado
- ✅ Búsqueda y filtros
- ✅ Vista de tabla con acciones rápidas

### Configuración de Tienda
- ✅ Nombre y descripción
- ✅ Logo personalizado
- ✅ Paleta de colores configurable (5 colores)
- ✅ Configuración regional (moneda, idioma, zona horaria)
- ✅ Los cambios se aplican en tiempo real

### Dashboard
- ✅ Estadísticas generales
- ✅ Total de productos y categorías
- ✅ Valor del inventario
- ✅ Accesos rápidos
- ✅ Productos activos vs inactivos

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Base de datos
npm run db:push          # Sincroniza schema con la DB
npm run db:studio        # Abre Prisma Studio (GUI)
npm run db:reset         # Resetea la DB (¡cuidado!)
npm run seed             # Ejecuta el seed

# Producción
npm run build            # Construye para producción
npm run start            # Inicia en producción
npm run lint             # Ejecuta ESLint
```

## 🎨 Personalización

### Cambiar colores del tema

1. Accede a **Dashboard > Configuración**
2. En la sección "Colores de la Marca" ajusta:
   - Color Primario (botones, enlaces)
   - Color Secundario (gradientes)
   - Color de Acento (destacados)
3. Guarda los cambios
4. Los colores se aplican automáticamente en toda la app

### Agregar nuevos atributos a productos

Los productos tienen un campo `attributes` (JSON) que permite agregar cualquier información:

```json
{
  "color": "rojo",
  "talla": "M",
  "material": "algodón",
  "marca": "Nike",
  "origen": "Vietnam"
}
```

Estos atributos se gestionan desde el formulario de producto.

## 🔒 Seguridad

- ✅ Autenticación con JWT
- ✅ Passwords hasheados con bcrypt (12 rounds)
- ✅ Rutas protegidas con middleware
- ✅ Validación de datos en backend
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

## 📱 Responsive Design

- ✅ Mobile first
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Sidebar colapsable en móvil
- ✅ Tablas con scroll horizontal
- ✅ Grids adaptables

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

```bash
# Verifica que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Inicia PostgreSQL si está detenido
sudo systemctl start postgresql

# Verifica la URL en .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/ecommerce_db"
```

### Error con Cloudinary

- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el Cloud Name no tenga espacios
- Revisa que la cuenta esté activa

### Error "NEXTAUTH_SECRET no definido"

```bash
# Genera un nuevo secret
openssl rand -base64 32

# Agrégalo al .env
NEXTAUTH_SECRET="el-secret-generado"
```

### Error al hacer seed

```bash
# Resetea la base de datos
npm run db:reset

# Vuelve a hacer push del schema
npm run db:push

# Ejecuta el seed nuevamente
npm run seed
```

## 🚀 Deploy a Producción

### Vercel (Recomendado)

1. Sube el código a GitHub
2. Conecta el repo en [vercel.com](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

### Base de datos en producción

Opciones recomendadas:
- [Neon](https://neon.tech) (PostgreSQL serverless)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 👨‍💻 Autor

Sistema desarrollado con Next.js 14, TypeScript y las mejores prácticas de desarrollo web moderno.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:
- Abre un issue en GitHub
- Revisa la sección de Troubleshooting
- Consulta la documentación de las tecnologías usadas

---

**¡Disfruta construyendo tu tienda! 🎉**
