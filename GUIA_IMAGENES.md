# Guía de Imágenes para Virtual Knockout

## 📁 Estructura de Carpetas

Todas las imágenes deben ir en la carpeta `boxing/` en la raíz del proyecto:

```
PaginaWeb-three-js/
├── boxing/
│   ├── sketch.png
│   ├── sketch1.png
│   ├── flujo-1.jpeg
│   ├── flujo-2.jpeg
│   ├── flujo-3.jpeg
│   ├── flujo-4.jpeg
│   ├── flujo-5.jpeg
│   ├── flujo-6.1.jpeg
│   ├── flujo-6.jpeg
│   ├── erik.png
│   ├── lizardo.png
│   ├── karla.png
│   ├── fernando.png
│   ├── cinturon.png
│   └── ganar.png
├── index.html
├── main.js
└── ...
```

## 🖼️ Lista Completa de Imágenes Necesarias

### **Fase 1: La Idea** (Sketches Conceptuales)
- `sketch.png` - Sketch inicial del concepto
- `sketch1.png` - Sketch conceptual alternativo

### **Fase 2: Sketching** (Flujos de Juego)
- `flujo-1.jpeg` - Flujo de juego parte 1
- `flujo-2.jpeg` - Flujo de juego parte 2
- `flujo-3.jpeg` - Flujo de juego parte 3
- `flujo-4.jpeg` - Flujo de juego parte 4
- `flujo-5.jpeg` - Flujo de juego parte 5
- `flujo-6.1.jpeg` - Flujo de juego parte 6.1
- `flujo-6.jpeg` - Flujo de juego parte 6

### **Fase 3: Prototipo** (Prototipo Final)
- `cinturon.png` - Imagen del cinturón (premio/logro)
- `ganar.png` - Imagen de victoria

### **Equipo** (Fotos de Perfil)
- `erik.png` - Foto de Erik Ramos (Desarrollador VR)
- `lizardo.png` - Foto de Lizardo Castillo (Diseñador UX/UI)
- `karla.png` - Foto de Karla Cornejo (Artista 3D)
- `fernando.png` - Foto de Fernando Deza (Ingeniero Software)

---

## 📐 Especificaciones Recomendadas

### Sketches y Flujos
- **Formato:** PNG o JPEG
- **Tamaño recomendado:** 1200x800px (o similar 3:2)
- **Peso:** < 500KB por imagen
- **Fondo:** Blanco o transparente preferible

### Fotos de Perfil del Equipo
- **Formato:** PNG (preferible con fondo transparente)
- **Tamaño:** 400x400px (cuadrado)
- **Peso:** < 200KB
- **Estilo:** Profesional, buena iluminación

### Imágenes de Prototipo
- **Formato:** PNG
- **Tamaño:** 1200x675px (16:9)
- **Peso:** < 500KB

---

## 🎨 Consejos de Diseño

### Para Sketches:
- Si son dibujos a mano, escanea con buena resolución (300 DPI)
- Asegúrate de que el texto sea legible
- Usa contraste adecuado

### Para Fotos de Perfil:
- Fondo neutro o transparente
- Buena iluminación
- Expresión profesional pero amigable
- Encuadre desde el pecho hacia arriba

### Para Capturas de Prototipo:
- Resolución nativa del juego
- Sin UI innecesaria
- Momentos clave del gameplay

---

## 🔄 Si No Tienes las Imágenes Aún

### Opción 1: Imágenes Placeholder
Puedes usar placeholders temporales mientras consigues las imágenes reales:
- https://placehold.co/1200x800/1a1a2e/00d4ff?text=Sketch+1
- https://placehold.co/400x400/1a1a2e/00d4ff?text=Erik

### Opción 2: Deshabilitar Temporalmente
Si prefieres no mostrar imágenes rotas, puedes comentar las imágenes en `gameContent.js`:

```javascript
media: [
    // { type: 'image', url: 'boxing/sketch.png', alt: 'Sketch conceptual' },
]
```

---

## ✅ Cómo Verificar que las Imágenes Funcionan

1. **Coloca las imágenes en la carpeta `boxing/`**
2. **Abre tu servidor** (ya está corriendo en puerto 8080)
3. **Navega al módulo Progreso** en el juego
4. **Verifica que se carguen correctamente** (no deberían aparecer errores 404 en la consola)

---

## 🐛 Solución de Problemas

### Las imágenes no se cargan (404 Not Found)
✅ **Verifica que:**
- La carpeta se llame exactamente `boxing` (minúsculas)
- Los nombres de archivo coincidan exactamente (incluido `.jpeg` vs `.jpg`)
- Las imágenes estén en la raíz del proyecto (mismo nivel que `index.html`)

### Las imágenes se ven muy grandes/pequeñas
✅ **El CSS ya está configurado para:**
- Ajustar automáticamente el tamaño
- Mantener proporciones
- Hacer responsive en móviles

### Las imágenes tardan en cargar
✅ **Optimiza tus imágenes:**
- Usa herramientas como TinyPNG o Squoosh
- Convierte a WebP si es posible
- Reduce resolución si es muy alta

---

## 📝 Ejemplo Rápido

Si quieres probar rápidamente con una imagen, crea la carpeta y agrega una imagen de prueba:

```bash
# En PowerShell
mkdir boxing
# Luego copia tus imágenes a esa carpeta
```

O si quieres usar una imagen de internet temporalmente, puedes modificar las URLs en `gameContent.js`:

```javascript
{ 
    type: 'image', 
    url: 'https://via.placeholder.com/1200x800/1a1a2e/00d4ff?text=Sketch', 
    alt: 'Sketch temporal' 
}
```

---

**¿Necesitas más ayuda?**
- Si no tienes alguna imagen, puedo ayudarte a crear placeholders
- Si quieres cambiar los nombres de archivo, puedo actualizar `gameContent.js`
- Si prefieres otra estructura de carpetas, puedo adaptar las rutas
