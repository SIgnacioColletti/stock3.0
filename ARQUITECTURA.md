# 🏗️ Arquitectura y Decisiones de Diseño

## 📐 Arquitectura del Proyecto

### Stack Tecnológico

**Frontend:**
- Next.js 14 con App Router (Server Components + Client Components)
- TypeScript para type safety
- Tailwind CSS para estilos
- Lucide React para iconos

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL

**Autenticación:**
- NextAuth.js con Credentials Provider
- JWT sessions
- bcrypt para hashing de passwords

**Media:**
- Cloudinary para almacenamiento de imágenes

---

## 🎯 Principios de Diseño

### 1. Genérico y Reutilizable
El sistema está diseñado para ser 100% genérico:
- **Atributos dinámicos** en JSON permiten cualquier tipo de producto
- **Categorías flexibles** sin restricciones
- **Configuración visual** sin tocar código
- **Campos opcionales** para adaptarse a diferentes necesidades

### 2. Escalable
- Componentes modulares y reutilizables
- API routes separadas por recurso
- Hooks personalizados (se pueden agregar)
- Lazy loading de imágenes

### 3. Mantenible
- Código bien comentado
- Estructura clara de carpetas
- Separación de responsabilidades
- Type safety con TypeScript

### 4. Performance
- Server Components por defecto
- Client Components solo cuando se necesita interactividad
- Optimización de imágenes con Next/Image
- Fetch de datos en el servidor

---

## 📊 Modelo de Datos

### Store (Tienda)
```typescript
{
  id: string
  name: string
  description?: string
  logo?: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  currency: string
  language: string
  timezone: string
}
```

### Category (Categoría)
```typescript
{
  id: string
  name: string
  slug: string (único)
  description?: string
  image?: string
  storeId: string
}
```

### Product (Producto)
```typescript
{
  id: string
  name: string
  slug: string (único)
  description?: string
  
  // Pricing
  price: number
  comparePrice?: number
  cost?: number
  
  // Inventory
  sku?: string (único)
  stock: number
  trackStock: boolean
  
  // Media
  images: string[] (URLs)
  
  // Atributos dinámicos
  attributes: Record<string, any>
  
  // Estados
  isActive: boolean
  isFeatured: boolean
  
  // Relaciones
  categoryId: string
  storeId: string
}
```

---

## 🔐 Seguridad

### Autenticación
- Passwords hasheados con bcrypt (12 salt rounds)
- Sessions basadas en JWT
- Tokens firmados con NEXTAUTH_SECRET

### Autorización
- Middleware de autenticación en todas las rutas protegidas
- Verificación de storeId en cada operación
- Un usuario solo puede acceder a los datos de su tienda

### Validación
- Validación en backend de todos los inputs
- Slugs únicos para evitar duplicados
- Verificaciones de relaciones (ej: no eliminar categoría con productos)

---

## 🎨 Sistema de Diseño

### Colores
```css
:root {
  --color-primary: #3b82f6;    /* Blue */
  --color-secondary: #8b5cf6;  /* Purple */
  --color-accent: #10b981;     /* Green */
}
```

Estos colores se actualizan dinámicamente desde la configuración.

### Componentes UI
Todos los componentes siguen el mismo patrón:
- **Props tipadas** con TypeScript
- **Variantes** para diferentes estilos
- **Estados** (hover, disabled, loading)
- **Accesibilidad** (labels, aria-attributes)
- **Animaciones** suaves con Tailwind

### Responsividad
Breakpoints de Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 🔄 Flujo de Datos

### Server Components (por defecto)
```
Usuario → Página → Fetch API → Base de datos → Renderizado en servidor → HTML al cliente
```

Ejemplos: Dashboard, listados de productos

### Client Components ('use client')
```
Usuario → Interacción → Estado local → API call → Actualización UI
```

Ejemplos: Formularios, modales, búsquedas

---

## 📁 Estructura de Carpetas

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── categories/    # CRUD categorías
│   │   ├── products/      # CRUD productos
│   │   ├── store/         # Configuración
│   │   └── upload/        # Subida de imágenes
│   ├── dashboard/         # Rutas protegidas del admin
│   └── login/             # Página de login
├── components/
│   ├── layout/            # Componentes de layout
│   └── ui/                # Componentes reutilizables
├── lib/                   # Utilidades y configuración
└── types/                 # Definiciones de TypeScript
```

---

## 🚀 Optimizaciones Implementadas

### 1. Imágenes
- Next/Image para optimización automática
- Lazy loading
- Cloudinary para CDN y transformaciones

### 2. Base de Datos
- Índices en campos frecuentemente consultados (slug, storeId)
- Cascade deletes para mantener integridad
- Prisma Client singleton para evitar múltiples conexiones

### 3. Rendering
- Server Components por defecto (menos JavaScript al cliente)
- Client Components solo para interactividad
- Streaming de datos con Suspense (se puede implementar)

### 4. API
- Validación temprana de datos
- Mensajes de error descriptivos
- Status codes apropiados

---

## 🔮 Posibles Mejoras Futuras

### Funcionalidades
- [ ] Sistema de órdenes/ventas
- [ ] Dashboard de analytics avanzado
- [ ] Múltiples usuarios con roles
- [ ] Historial de cambios (audit log)
- [ ] Importación/exportación CSV
- [ ] Multi-idioma en el admin
- [ ] SEO metadata por producto
- [ ] Variantes de productos
- [ ] Sistema de descuentos
- [ ] Integración con pasarelas de pago

### Técnicas
- [ ] Testing con Jest + React Testing Library
- [ ] CI/CD con GitHub Actions
- [ ] Docker para desarrollo
- [ ] Cache con Redis
- [ ] Paginación infinita
- [ ] Búsqueda con Algolia
- [ ] Real-time con WebSockets
- [ ] PWA support

---

## 💡 Decisiones de Diseño Importantes

### ¿Por qué Next.js 14?
- App Router para mejor organización
- Server Components para performance
- API Routes integradas
- Excelente DX (Developer Experience)

### ¿Por qué Prisma?
- Type safety end-to-end
- Migraciones automáticas
- Prisma Studio para debugging
- Excelente integración con TypeScript

### ¿Por qué PostgreSQL?
- Open source y gratuito
- Robusto y confiable
- JSON support para atributos dinámicos
- Excelente performance

### ¿Por qué Cloudinary?
- Plan gratuito generoso
- CDN global
- Transformaciones automáticas
- Fácil integración

### ¿Por qué Tailwind?
- Desarrollo rápido
- No hay CSS custom que mantener
- Purge automático (CSS pequeño)
- Diseño consistente

---

## 🎓 Patrones Utilizados

### Repository Pattern
Aunque no está explícitamente implementado, las API routes actúan como repositorios.

### Component Composition
Los componentes UI son pequeños y composables.

### Separation of Concerns
- Lógica de negocio en API routes
- UI en componentes
- Utilidades en /lib
- Tipos en /types

### DRY (Don't Repeat Yourself)
- Componentes reutilizables
- Utilidades compartidas
- Configuración centralizada

---

## 📝 Convenciones de Código

### Naming
- Componentes: PascalCase (`Button.tsx`)
- Archivos: kebab-case (`use-products.ts`)
- Funciones: camelCase (`fetchProducts`)
- Constantes: UPPER_CASE (`MAX_IMAGES`)

### Imports
```typescript
// 1. Librerías externas
import { useState } from 'react';

// 2. Imports internos
import Button from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';

// 3. Tipos
import type { Product } from '@prisma/client';
```

### Components
```typescript
'use client'; // Solo si es necesario

import { FC } from 'react';

interface Props {
  // Props tipadas
}

export default function Component({ prop }: Props) {
  // Hooks primero
  // Funciones después
  // Return al final
  return <div>...</div>;
}
```

---

**Este documento está vivo y debe actualizarse con cada cambio significativo en la arquitectura.**
