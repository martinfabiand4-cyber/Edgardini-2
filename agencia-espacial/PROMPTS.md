# Documentación de prompts de IA

Entregable obligatorio: aquí se registran los prompts usados, lo que respondió la IA y qué decisión se tomó.
Reemplaza la columna "Respuesta" con la respuesta real de tu IA si repites el ejercicio.

## Prompt 1 — Contenido (Paso 1)
**Prompt:**
> Actúa como un experto en marketing. Estoy creando una web para una agencia de turismo espacial ficticia. Dame 1 nombre creativo para la agencia, 1 eslogan corto y persuasivo, y 3 destinos turísticos en el sistema solar con una breve descripción de 15 palabras para cada uno.

**Resultado usado:**
- Nombre: **AstraNova Expediciones**
- Eslogan: **"El universo te espera. Reserva tu órbita."**
- Destinos: La Luna (Base Selene), Marte (Colonia Olimpo), Saturno y Titán (Crucero Anillos). Descripciones de ~15 palabras en la sección Destinos.

**Decisión:** se eligió un nombre corto y pronunciable; se añadió el Puerto Espacial Atacama (Chile) como punto de partida.

## Prompt 2 — Contenido ampliado (secciones añadidas)
**Prompt:**
> Para la misma agencia, escribe: 6 beneficios (título + una frase), 4 pasos para reservar un viaje, 3 planes con precio ficticio en USD, 3 testimonios ficticios cortos y 5 preguntas frecuentes con respuesta de una frase.

**Decisión:** los datos son ficticios y el footer lo avisa explícitamente.

## Prompt 3 — Paleta de colores (Paso 3)
**Prompt:**
> Dame una paleta de colores de 3 tonos (fondo, texto principal y color de acento para botones) que transmita una vibra espacial y futurista, utilizando exclusivamente las clases de colores predeterminadas de Tailwind CSS (ejemplo: bg-slate-900, text-cyan-400).

**Resultado usado:**
| Rol | Clase |
|---|---|
| Fondo | `bg-slate-950` (superficies `bg-slate-900`) |
| Texto principal | `text-slate-100` (secundario `text-slate-300`) |
| Acento | `bg-cyan-400` con `hover:bg-cyan-500` y texto `text-slate-950` |

**Decisión:** el texto oscuro sobre cian da contraste alto (AA). El violeta se usa solo en brillos decorativos.

## Prompt 4 — Pair programming: grid (Paso 5)
**Prompt:**
> Estoy usando Tailwind CSS y HTML. ¿Cómo puedo hacer un contenedor Grid que tenga 1 columna en móviles (pantallas pequeñas) y 3 columnas en pantallas medianas o grandes (md)? Dame solo la estructura del contenedor.

**Resultado usado:**
```html
<div class="grid grid-cols-1 gap-6 md:grid-cols-3"> ... </div>
```
**Decisión:** `grid-cols-1` es la base (móvil primero) y `md:grid-cols-3` activa 3 columnas desde 768 px.

## Prompt 5 — Problema de diseño: menú móvil
**Prompt:**
> Mi navbar con Flexbox se desborda en móvil con 5 enlaces. ¿Cómo hago un menú que se oculte en pantallas pequeñas con un botón hamburguesa usando solo clases por defecto de Tailwind y poco JavaScript?

**Resultado usado:** `hidden md:flex` en la lista, botón con `md:hidden` y un script corto que alterna `hidden`/`flex` y actualiza `aria-expanded`.

## Prompt 6 — Sistema solar 3D interactivo
**Prompt:**
> Necesito una sección de mi landing con un sistema solar 3D interactivo. Debe usar Three.js desde CDN, texturas generadas por código (sin imágenes), órbitas animadas, que se pueda girar y hacer zoom, y un panel con datos de cada planeta. La Luna, Marte y Saturno deben destacarse porque son mis destinos, con un botón que lleve al formulario de reserva. Primero hazme un plan por etapas.

**Resultado usado:** plan en `PLAN-3D.md` e implementación en `js/sistema-solar.js`.

**Decisiones tomadas:** todo el sistema solar; texturas con `canvas`; JS en archivo aparte; escala artística con aviso visible; exploración con botón en móviles para no bloquear el scroll.
