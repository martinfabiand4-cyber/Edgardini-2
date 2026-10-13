# Planificación — Landing Page "AstraNova Expediciones"

Agencia de viajes espaciales (ficticia). Proyecto educativo: HTML5 semántico + Tailwind CSS (CDN) + IA como asistente.

---

## 1. Análisis del prompt original

### Qué está bien
- Objetivo claro, stack acotado (HTML5 + Tailwind CDN), entregable definido y rúbrica simple.
- Obliga a usar IA para contenido, paleta y resolver un problema de diseño, y a documentar los prompts.

### Qué le falta (y qué se añadió en esta versión)

| # | Hueco detectado | Por qué importa | Solución aplicada |
|---|---|---|---|
| 1 | **Menú móvil**: pide `flex justify-between` pero no dice qué pasa en pantallas pequeñas | Con 5 enlaces el menú se desborda en móvil ("la página se rompe") | Botón hamburguesa + menú desplegable con JS mínimo (`aria-expanded`) |
| 2 | **Solo 4 secciones**: una landing real necesita convencer, no solo mostrar | Sin prueba social, proceso ni precios no hay conversión | Se añaden: beneficios, cómo funciona, planes, testimonios, FAQ y formulario de reserva |
| 3 | **Sin formulario / conversión final**: el CTA del Hero no lleva a ningún sitio | Un CTA sin destino no es CTA | Todos los CTA apuntan a `#reservas` (formulario con validación nativa) |
| 4 | **Sin accesibilidad** (no se menciona en la rúbrica) | Dark mode con mal contraste o sin foco visible excluye usuarios | Contraste AA, `focus-visible`, enlace "saltar al contenido", `aria-label`, `alt`, `motion-reduce` |
| 5 | **Sin SEO ni metadatos** | Título, descripción y `lang` son parte del HTML5 correcto | `<title>`, `meta description`, `theme-color`, `lang="es"` |
| 6 | **Sin imágenes**: no dice de dónde sacarlas (derechos, peso, enlaces rotos) | Es el punto donde más fallan los trabajos | Planetas dibujados solo con clases de Tailwind (degradados, `rounded-full`): 0 imágenes externas |
| 7 | **Contradicción**: "solo clases por defecto" vs. animaciones/fondos espaciales | Sin CSS propio no hay estrellas ni brillo | Se resuelve con utilidades por defecto: `animate-pulse`, `bg-gradient-to-*`, `shadow-*`, `blur-*` |
| 8 | **Rúbrica incompleta**: no evalúa accesibilidad, rendimiento ni documentación de prompts con detalle | Evaluación difusa | Se amplía la rúbrica (sección 5) |
| 9 | **Sin criterio de "terminado"** ni pruebas | No se sabe cuándo está listo | Checklist de verificación por etapa (sección 3) |
| 10 | **Sin fuente de verdad del contenido**: los textos de la IA "se guardan" pero no se documentan | Rúbrica pide documentar prompts | `PROMPTS.md` con prompt → respuesta → decisión |
| 11 | **Nombre/eslogan/destinos** no se fijan | Dispersión al implementar | Se fijan en la sección 2 |
| 12 | **Aviso de ficción** ausente | Precios y datos inventados podrían confundirse con reales | Aviso visible en el footer |

---

## 2. Decisiones de contenido y diseño

**Marca:** AstraNova Expediciones
**Eslogan:** *"El universo te espera. Reserva tu órbita."*

**Destinos (3 tarjetas obligatorias):**
1. **Luna · Base Selene** — hotel de cristal con vista a la Tierra. 5 días.
2. **Marte · Colonia Olimpo** — ascenso al volcán más alto del sistema solar. 21 días.
3. **Saturno · Titán** — navegación entre los anillos y aterrizaje en Titán. 45 días.

**Paleta (solo clases por defecto de Tailwind):**

| Rol | Clase |
|---|---|
| Fondo | `bg-slate-950` / superficies `bg-slate-900` |
| Texto principal | `text-slate-100` (secundario `text-slate-300/400`) |
| Acento (botones) | `bg-cyan-400` → `hover:bg-cyan-500` con `text-slate-950` |
| Acento secundario | `violet-500` / `fuchsia-500` solo en degradados |

**Tipografía:** pila del sistema de Tailwind (`font-sans`), sin dependencias externas.
**Breakpoints:** móvil primero; `md:` (≥768px) para 3 columnas; `lg:` para el Hero a dos columnas.

---

## 3. Planificación por etapas

### Etapa 0 — Análisis y planificación ✅
- Revisar el prompt, detectar huecos, fijar decisiones (este documento).
- **Entregable:** `PLAN.md`.

### Etapa 1 — Ideación de contenido con IA ✅
- Prompt de marketing: nombre, eslogan, 3 destinos de 15 palabras.
- Ampliar con un segundo prompt: beneficios, pasos, planes, testimonios, FAQ.
- **Entregable:** textos finales + `PROMPTS.md`.
- **Hecho cuando:** no queda ningún "Lorem ipsum" y cada texto está justificado en `PROMPTS.md`.

### Etapa 2 — Esqueleto HTML5 semántico ✅
- `<!doctype html>`, `lang`, metadatos, CDN de Tailwind en `<head>`.
- Estructura: `<header>` → `<main>` (varias `<section>` con `aria-labelledby`) → `<footer>`.
- **Hecho cuando:** la página se entiende sin estilos y hay un único `<h1>`.

### Etapa 3 — Sistema visual (paleta y base) ✅
- Aplicar paleta de la sección 2 al `<body>` y a las superficies.
- Escala de espaciado y tipografía coherentes (`py-20`, `max-w-6xl`, `text-4xl md:text-6xl`).
- **Hecho cuando:** contraste mínimo AA en todo el texto.

### Etapa 4 — Componentes obligatorios ✅
- **Navbar** con Flexbox (`flex justify-between items-center`) + menú móvil.
- **Hero** con título, subtítulo, CTA (`hover:bg-cyan-500 transition-all`), cuenta regresiva al próximo despegue.
- **Destinos** con grid `grid-cols-1 md:grid-cols-3`.
- **Footer** con copyright y redes ficticias.
- **Hecho cuando:** cumple todos los puntos de "Estructura obligatoria".

### Etapa 5 — Secciones de conversión (lo añadido) ✅
- Beneficios, Cómo funciona (4 pasos), Planes (3), Testimonios (3), FAQ (`<details>`), Formulario de reserva.
- **Hecho cuando:** cada CTA lleva a `#reservas` y el formulario valida campos obligatorios.

### Etapa 6 — Interacción mínima ✅
- Menú móvil, cuenta regresiva, preselección de destino y mensaje de éxito del formulario.
- Sin librerías: ~40 líneas de JS.
- **Hecho cuando:** todo funciona con teclado y respeta `prefers-reduced-motion`.

### Etapa 7 — Pair programming con IA y depuración ✅
- Usar la IA para resolver el reto del grid (prompt del Paso 5) y revisar el código.
- Anotar cada duda y su solución en `PROMPTS.md`.

### Etapa 8 — QA y entrega ✅
Checklist de verificación:
- [x] 360 px, 768 px y 1280 px sin scroll horizontal.
- [x] 1 columna en móvil → 3 columnas desde `md`.
- [x] Sin `style="..."` ni CSS externo.
- [x] Solo clases de color por defecto de Tailwind.
- [x] Navegación completa con teclado, foco visible.
- [x] Consola sin errores.
- [x] `PROMPTS.md` completo.
- **Entregable:** `index.html` + `PROMPTS.md` (o enlace a GitHub Pages/CodePen).

---

## 4. Estructura final de la página

```
Header sticky (logo · menú · CTA)
Hero (título · subtítulo · CTA · cuenta regresiva · cifras)
Destinos (grid 1 → 3 columnas)
Beneficios (6 tarjetas)
Cómo funciona (4 pasos)
Planes (3 niveles)
Testimonios (3)
FAQ (5 preguntas)
Reservas (formulario)
Footer (redes · aviso de ficción · copyright)
```

> Ampliación: se añadió la sección **Explora** (sistema solar 3D) entre Destinos y Beneficios. Ver `PLAN-3D.md`.

## 5. Rúbrica ampliada (para el profesor)

| Criterio | Excelente | Necesita mejorar |
|---|---|---|
| HTML semántico | `header`, `main`, `section`, `footer`, un solo `h1`, jerarquía de títulos | Solo `div` |
| Tailwind | Utilidades correctas, sin CSS propio ni `style` | CSS en línea o archivo externo innecesario |
| Responsivo | Prefijos `md:`/`lg:`, menú móvil funcional | Se rompe en pantallas pequeñas |
| **Accesibilidad** *(nuevo)* | Contraste AA, foco visible, `alt`/`aria-*`, uso con teclado | Texto ilegible o no navegable con teclado |
| Integración de IA | Prompts documentados con decisión tomada | Texto genérico sin evidencia |
| **Completitud** *(nuevo)* | Sección de conversión + formulario funcional | Solo las 4 secciones mínimas |
