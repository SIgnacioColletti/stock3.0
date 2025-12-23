# 🔄 INSTRUCCIONES DE ACTUALIZACIÓN - Paquete Esencial de Stock

## ⚠️ IMPORTANTE: Actualiza tu Base de Datos

Se agregaron nuevas funcionalidades de gestión de stock. Debes actualizar tu base de datos.

## 📝 Pasos para Actualizar

### 1. Detén el servidor
```bash
# Presiona Ctrl+C en la terminal donde corre npm run dev
```

### 2. Actualiza el schema de Prisma
El archivo `prisma/schema.prisma` ya está actualizado con los nuevos modelos:
- ✅ Campo `minStock` en Product
- ✅ Modelo StockMovement (movimientos de stock)
- ✅ Modelo Sale (ventas)
- ✅ Modelo SaleItem (items de venta)

### 3. Sincroniza la base de datos
```bash
# Sincroniza los cambios con tu base de datos
npm run db:push
```

### 4. Inicia el servidor
```bash
npm run dev
```

## ✨ Nuevas Funcionalidades Disponibles

### 1. **Ventas** (`/dashboard/sales`)
- Registrar ventas con múltiples productos
- 5 formas de pago: Efectivo, Transferencia, Débito, Crédito, QR
- Referencia de pago (número de transferencia, últimos 4 dígitos, etc.)
- Datos del cliente (opcional)
- Descuenta automáticamente el stock
- Historial completo de ventas

### 2. **Inventario** (`/dashboard/inventory`)
- Dashboard con estadísticas en tiempo real
- Alertas de stock bajo (configurables por producto)
- Productos sin stock destacados
- Ajustes manuales de stock con motivo
- Historial de movimientos
- Exportar a CSV
- Valorización de inventario
- Ganancia potencial

### 3. **Reportes**
- Total de productos y unidades
- Valor total del inventario
- Costo total
- Ganancia potencial
- Margen promedio
- Productos con stock bajo
- Productos sin stock

## 🎯 Cómo Usar las Nuevas Funciones

### Registrar una Venta
1. Ve a **Ventas** en el menú
2. Clic en **Nueva Venta**
3. Selecciona productos (clic en cada producto para agregar)
4. Ajusta cantidades si es necesario
5. Selecciona forma de pago
6. Opcional: Agrega referencia de pago y datos del cliente
7. Clic en **Registrar Venta**

El stock se descuenta automáticamente y se crea un movimiento en el historial.

### Ajustar Stock Manualmente
1. Ve a **Inventario**
2. En las alertas, clic en **Ajustar** en el producto
3. Ingresa el ajuste (positivo para aumentar, negativo para disminuir)
4. Selecciona el motivo (Ajuste, Compra, Devolución, etc.)
5. Agrega notas opcionales
6. Clic en **Guardar Ajuste**

### Ver Alertas de Stock
1. Ve a **Inventario**
2. Verás automáticamente:
   - Productos sin stock (rojo)
   - Productos con stock bajo (amarillo)

### Configurar Stock Mínimo
1. Al crear o editar un producto
2. En la sección **Inventario**
3. Campo **Stock Mínimo** (por defecto es 5)
4. Cuando el stock llegue a este nivel o menos, aparecerá una alerta

### Exportar Inventario
1. Ve a **Inventario**
2. Clic en **Exportar CSV**
3. Se descarga un archivo con todos los productos

## 🔍 Nuevas Secciones en el Menú

- 🛒 **Ventas**: Registra y consulta ventas
- 📦 **Inventario**: Gestión de stock y reportes

## 📊 Formas de Pago Disponibles

1. **💵 Efectivo** (CASH)
2. **📱 Transferencia** (TRANSFER)
3. **💳 Débito** (DEBIT)
4. **💳 Crédito** (CREDIT)
5. **📱 QR/MercadoPago** (QR)

## 🐛 Si algo sale mal

**Error: "Column 'minStock' does not exist"**
```bash
# Asegúrate de haber ejecutado:
npm run db:push
```

**Error al sincronizar base de datos**
```bash
# Si hay problemas, puedes resetear (⚠️ PERDERÁS DATOS):
npm run db:reset
npm run seed
```

**Error: "Cannot find module"**
```bash
# Reinstala dependencias
npm install
```

## ✅ Verificación

Después de actualizar, deberías poder:
- [ ] Ver las secciones "Ventas" e "Inventario" en el menú
- [ ] Crear una venta de prueba
- [ ] Ver alertas de stock en Inventario
- [ ] Ajustar el stock de un producto
- [ ] Ver el historial de movimientos
- [ ] Exportar el inventario a CSV

---

**¡Listo!** Tu sistema ahora tiene gestión completa de stock y ventas 🎉
