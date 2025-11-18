# Mejoras al Módulo de Mantenimientos

## Resumen de Cambios

Se han implementado mejoras significativas al módulo de mantenimientos para gestionar y visualizar imágenes de manera más eficiente y profesional.

---

## 1. Vista de Miniaturas en la Tabla

### Características:
- ✅ **Nueva columna "Imágenes"** en la tabla de mantenimientos
- ✅ Muestra hasta **3 miniaturas** (50x50px) por mantenimiento
- ✅ Badge con el **tipo de imagen** en cada miniatura (equipo, antes, después, formato)
- ✅ Indicador **"+N"** cuando hay más de 3 imágenes
- ✅ **Hover effect** con zoom suave al pasar el cursor
- ✅ **Click** en miniatura abre galería completa
- ✅ Mensaje "Sin imágenes" para mantenimientos sin fotos

### Vista en la Tabla:
```
+----+----------+------+--------+-----------+
| #  | Entidad  | Tipo | Estado | Imágenes  |
+----+----------+------+--------+-----------+
| 1  | PC-001   | Prev | OK     | [img][img][img] +2 |
| 2  | IMP-005  | Corr | Prog   | Sin imágenes |
+----+----------+------+--------+-----------+
```

---

## 2. Galería Modal de Imágenes

### Características:
- ✅ **Modal fullscreen** para visualización de imágenes
- ✅ Imagen principal en **tamaño grande** (hasta 600px altura)
- ✅ **Navegación** con botones anterior/siguiente
- ✅ **Contador** de imagen actual (ej: 2/5)
- ✅ **Overlay de información** sobre la imagen:
  - Tipo de imagen (badge)
  - Descripción (si existe)
- ✅ **Tira de miniaturas** en la parte inferior
- ✅ Miniatura activa **resaltada** con borde azul
- ✅ Click en miniatura salta a esa imagen
- ✅ Fondo negro para mejor contraste
- ✅ Responsive: se adapta a móviles

### Navegación:
- **Botones circulares** a los lados de la imagen principal
- Deshabilitados automáticamente al llegar al inicio/final
- **Teclas de flecha** (próximamente se puede agregar)

---

## 3. Formulario Mejorado para Carga de Imágenes

### Características:
- ✅ **Preview visual** de cada imagen seleccionada (80x80px)
- ✅ Campos editables para cada imagen:
  - **Tipo** (equipo, antes, después, formato)
  - **Descripción** (opcional)
- ✅ **Botón eliminar** (X) en cada imagen para removerla antes de guardar
- ✅ Layout tipo "tarjeta" para cada imagen
- ✅ **Scroll** automático si hay muchas imágenes
- ✅ Contador de imágenes seleccionadas

### Flujo de Trabajo:
1. Usuario selecciona múltiples archivos (.jpg, .jpeg, .png)
2. Se generan previsualizaciones automáticas
3. Usuario edita tipo y descripción de cada imagen
4. Puede eliminar imágenes individuales si se equivocó
5. Al guardar, se envían con sus metadatos

### Vista del Formulario:
```
┌─────────────────────────────────────────────┐
│ Imágenes (múltiples)                        │
│ [Seleccionar archivos...]                   │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Preview] │ Tipo: [equipo      v]     │  │
│ │   80x80   │ Desc: [................] │[X]│
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Preview] │ Tipo: [antes       v]     │  │
│ │   80x80   │ Desc: [Estado inicial...]│[X]│
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 4. Envío Correcto de Datos al Backend

### Formato FormData:
Ahora el frontend envía los datos correctamente según la API del backend:

```javascript
FormData:
├─ maintainable_type: "device"
├─ maintainable_id: 1
├─ maintenance_date: "2025-11-18"
├─ physical_format: [File] formato.pdf
├─ images[0]: [File] imagen1.jpg
├─ images[1]: [File] imagen2.jpg
├─ images[2]: [File] imagen3.jpg
├─ image_types[0]: "antes"
├─ image_types[1]: "despues"
├─ image_types[2]: "equipo"
├─ image_descriptions[0]: "Estado inicial"
├─ image_descriptions[1]: "Después del mantenimiento"
└─ image_descriptions[2]: "Vista general"
```

### Validaciones Backend:
- **images.***: hasta 10MB por imagen
- **physical_format**: hasta 50MB (PDF/imagen)
- **Tipos permitidos**: equipo, antes, despues, formato

---

## 5. Funciones JavaScript Agregadas

### Gestión de Imágenes:
```javascript
handleImages(event)       // Procesa archivos seleccionados
removeImage(index)        // Elimina una imagen de la lista
getImageUrl(path)         // Construye URL completa de imagen
```

### Galería:
```javascript
openImageGallery(images, startIndex)  // Abre modal en imagen específica
closeImageGallery()                   // Cierra modal
prevImage()                           // Navega a imagen anterior
nextImage()                           // Navega a imagen siguiente
```

### Limpieza de Memoria:
```javascript
resetForm() {
  // Libera URLs de objetos para prevenir memory leaks
  form.value.imageDetails.forEach(img => {
    URL.revokeObjectURL(img.preview)
  })
}
```

---

## 6. Estilos CSS Agregados

### Clases Principales:
- `.images-cell` - Columna de imágenes en tabla
- `.thumbnails-container` - Contenedor de miniaturas
- `.thumbnail` - Miniatura individual (50x50px)
- `.image-type-badge` - Badge sobre miniatura
- `.more-images` - Indicador "+N más imágenes"
- `.selected-images-list` - Lista de imágenes en formulario
- `.selected-image-item` - Item individual con preview
- `.image-gallery-modal` - Modal de galería
- `.gallery-content` - Contenedor principal de galería
- `.gallery-main` - Área de imagen principal
- `.main-image-container` - Contenedor con fondo negro
- `.gallery-nav` - Botones de navegación
- `.gallery-thumbnails` - Tira de miniaturas

### Efectos Visuales:
- **Transiciones suaves** en hover
- **Transform scale** para zoom en miniaturas
- **Gradiente oscuro** en overlay de info
- **Box-shadow** en miniatura activa
- **Border animado** en hover

---

## 7. Responsive Design

### Adaptaciones Móviles:
```css
@media (max-width: 768px) {
  - Galería optimizada para pantallas pequeñas
  - Botones de navegación más pequeños (40x40px)
  - Altura de imagen reducida (400px max)
  - Thumbnails centrados
  - Layout de formulario en columna
  - Selected-image-item en columna vertical
}
```

---

## 8. URL del Storage

### Configuración:
```javascript
function getImageUrl(path) {
  return `http://computermanagement-backend.test/storage/${path}`
}
```

**Importante**: Asegúrate de que:
1. El backend tiene el storage link creado: `php artisan storage:link`
2. Las imágenes se guardan en `storage/app/public/maintenances/`
3. Son accesibles en `public/storage/maintenances/`

---

## 9. Flujo Completo de Uso

### Crear Mantenimiento con Imágenes:

1. **Abrir modal**: Click en "Agregar Mantenimiento"
2. **Llenar datos básicos**: Entidad, fecha, tipo, etc.
3. **Seleccionar imágenes**: Click en input de archivos
4. **Editar metadatos**: Para cada imagen:
   - Seleccionar tipo (equipo/antes/despues/formato)
   - Agregar descripción opcional
5. **Remover errores**: Si seleccionaste una imagen por error, click en [X]
6. **Guardar**: El sistema envía todo al backend
7. **Visualizar**: En la tabla aparecen las miniaturas

### Ver Imágenes:

1. **En tabla**: Click en cualquier miniatura
2. **Se abre galería** con la imagen seleccionada
3. **Navegar**: Usar botones o click en miniaturas inferiores
4. **Ver info**: Tipo y descripción en overlay
5. **Cerrar**: Click en X o fuera del modal

---

## 10. Archivos Modificados

### Frontend:
- ✅ `src/views/Maintenances.vue` - Actualizado completamente
  - Template: Nueva columna, modal de galería, preview de imágenes
  - Script: Nuevas funciones de gestión de imágenes
  - Styles: +270 líneas de CSS

### Backend (según tu mensaje):
- ✅ `app/Http/Controllers/MaintenanceController.php`
  - Validación ajustada: `images.*`, `image_types.*`, `image_descriptions.*`
  - Manejo correcto de array de archivos
  - Límites: 10MB por imagen, 50MB formato físico

---

## 11. Características Técnicas

### Performance:
- **Object URLs** para previews (no re-lectura de archivos)
- **Lazy loading** potencial para muchas imágenes
- **Memory cleanup** con URL.revokeObjectURL
- **Límite de 3 miniaturas** en tabla para mejor rendimiento

### Seguridad:
- Validación de tipos de archivo en frontend
- Validación robusta en backend
- Sanitización de inputs
- Límites de tamaño configurables

### UX:
- **Feedback visual** inmediato al seleccionar archivos
- **Previews** antes de guardar
- **Edición inline** de metadatos
- **Navegación intuitiva** en galería
- **Responsive** en todos los dispositivos

---

## 12. Próximas Mejoras Sugeridas

### Futuras Features:
- [ ] Navegación con **teclas de flecha** en galería
- [ ] **Zoom avanzado** con pinch/doble click
- [ ] **Drag & drop** para ordenar imágenes
- [ ] **Crop/rotate** antes de guardar
- [ ] **Lazy loading** de imágenes en tabla
- [ ] **Paginación** de miniaturas en galería
- [ ] **Lightbox** con animaciones de transición
- [ ] **Descargar imagen** desde galería
- [ ] **Compartir** imagen individual
- [ ] **Comparador** antes/después con slider

---

## 13. Testing

### Casos de Prueba:
1. ✅ Crear mantenimiento sin imágenes
2. ✅ Crear mantenimiento con 1 imagen
3. ✅ Crear mantenimiento con 5+ imágenes
4. ✅ Ver galería con múltiples imágenes
5. ✅ Navegar con botones anterior/siguiente
6. ✅ Click en miniaturas de galería
7. ✅ Eliminar imagen antes de guardar
8. ✅ Editar tipo y descripción de imagen
9. ✅ Responsive en móvil
10. ✅ Manejo de imágenes grandes (>5MB)

---

## 14. Troubleshooting

### Problema: No se ven las imágenes
**Solución**:
```bash
# En el backend
php artisan storage:link

# Verificar permisos
chmod -R 775 storage/app/public
```

### Problema: Error al subir imágenes
**Solución**:
- Verificar límites en `php.ini`:
  - `upload_max_filesize = 50M`
  - `post_max_size = 50M`
- Verificar validación en backend
- Ver console del navegador para errores JS

### Problema: Miniaturas no aparecen en tabla
**Solución**:
- Verificar que el endpoint devuelva el array `images` en la relación
- En el modelo `Maintenance`: `return $this->hasMany(MaintenanceImage::class)`
- En el controlador: `->with('images')`

---

¡El módulo de mantenimientos ahora tiene una gestión profesional de imágenes! 📸✨
