# Plan — Sección "Sistema Solar 3D interactivo"

Nueva sección de la landing AstraNova que muestra un sistema planetario en 3D que el visitante puede girar, acercar y explorar. Conecta con los destinos del viaje (Luna, Marte, Saturno).

---

## 1. Objetivo y alcance

**Objetivo:** que el visitante *explore* el sistema solar y termine eligiendo un destino para reservar.

**Incluye**
- Escena 3D con Sol, 8 planetas, la Luna y los anillos de Saturno, con órbitas animadas.
- Control con mouse, dedo y teclado: girar, acercar y seleccionar planeta.
- Panel de información por planeta (distancia, duración del viaje, dato curioso).
- Los 3 destinos de la agencia (Luna, Marte, Saturno) resaltados, con botón "Reservar" que preselecciona el formulario.

**No incluye** (para no inflar el alcance)
- Escala real de distancias y tamaños (imposible de ver; se usa escala artística y se avisa).
- Texturas fotográficas externas, física real, sonido.

---

## 2. Decisiones técnicas

| Tema | Decisión | Por qué |
|---|---|---|
| Librería 3D | **Three.js**, versión fija, desde CDN (cdnjs o jsDelivr) | Estándar, no requiere instalar nada, cumple el enfoque "solo CDN" |
| Controles | `OrbitControls` (girar y zoom); sin desplazamiento lateral | Cámara intuitiva con mouse y táctil |
| Texturas | **Generadas por código** (`CanvasTexture`, degradados y ruido) | 0 imágenes externas, 0 enlaces rotos, carga instantánea |
| Estilo de la sección | Tailwind para el contenedor, panel y botones; el canvas lo crea Three.js | Mantiene la regla de "sin CSS propio" |
| JS | Archivo aparte `js/sistema-solar.js` | Separa la lógica 3D del HTML, que ya es largo |
| Escala | Orbitas y tamaños comprimidos; nota visible "No está a escala" | Honestidad y legibilidad |

---

## 3. Diseño de la sección

**Ubicación:** entre *Destinos* y *Por qué AstraNova*. Nuevo enlace "Explora" en el menú, con id `#sistema-solar`.

**Layout**
- **Escritorio:** canvas grande a la izquierda (~2/3) y panel de información a la derecha (~1/3).
- **Móvil:** canvas arriba con altura fija (~60vh), panel debajo; lista de planetas como botones con scroll horizontal.

**Elementos**
1. Título y subtítulo de la sección.
2. Canvas 3D (altura fija, nunca 100vh).
3. Lista de planetas (botones) para elegir sin arrastrar.
4. Panel: nombre, distancia, duración del viaje, dato curioso y botón "Reservar este destino" (solo si es Luna, Marte o Saturno).
5. Controles: pausar/reanudar órbitas, restablecer vista.
6. Nota "Escala artística, no real".

---

## 4. Etapas

### Etapa 1 — Datos y contenido
- Tabla de datos de los cuerpos: nombre, tamaño relativo, radio orbital comprimido, velocidad orbital, color, dato curioso, duración del viaje ficticia.
- Textos con IA (registrar el prompt en `PROMPTS.md`).
- **Hecho cuando:** los datos viven en un único objeto JS, sin números sueltos en el código.

### Etapa 2 — Escena base
- Renderizador, cámara, luces (Sol como luz puntual), fondo de estrellas (puntos aleatorios).
- Esferas de los planetas con texturas procedurales.
- **Hecho cuando:** se ven Sol y planetas sin errores en consola.

### Etapa 3 — Órbitas y animación
- Anillos orbitales visibles, planetas orbitando, rotación propia, anillos de Saturno, Luna alrededor de la Tierra.
- **Hecho cuando:** movimiento fluido a 60 fps en un portátil normal.

### Etapa 4 — Interacción
- `OrbitControls` con límites de zoom, rotación suave (amortiguada).
- Clic o toque en un planeta: la cámara se acerca con animación y se abre el panel.
- Lista de botones sincronizada con la selección.
- **Hecho cuando:** se puede explorar solo con mouse, solo con dedo y solo con teclado.

### Etapa 5 — Integración con la página
- Sección HTML con Tailwind, enlace en el menú y en el footer.
- Botón "Reservar este destino" que hace scroll a `#reservas` y preselecciona el destino (reutiliza `data-destino`).
- Los 3 destinos de la agencia se destacan con un halo.
- **Hecho cuando:** el flujo explorar → reservar funciona de punta a punta.

### Etapa 6 — Rendimiento
- Iniciar la escena solo cuando la sección entra en pantalla (`IntersectionObserver`).
- Pausar el dibujado cuando sale de pantalla o la pestaña no está visible.
- Limitar la resolución (`devicePixelRatio` máximo 2; 1.5 en móvil).
- Reutilizar geometrías y liberar memoria al destruir.
- **Hecho cuando:** sin tráfico de CPU/GPU con la sección fuera de pantalla.

### Etapa 7 — Móvil y accesibilidad
- **Gestos:** el canvas no debe "atrapar" el scroll de la página. Un dedo hace scroll normal; dos dedos giran y hacen zoom, o bien hay un botón "Activar exploración".
- Botones táctiles de al menos 44 px.
- Canvas con `role="img"` y descripción; la información del planeta en una región `aria-live`.
- Respeta `prefers-reduced-motion`: órbitas pausadas por defecto.
- **Plan B si no hay WebGL o falla la carga:** tarjetas 2D con los planetas dibujados con degradados (ya existentes en Destinos) y el mismo panel de datos.
- **Hecho cuando:** pasa la lista de verificación de abajo.

### Etapa 8 — QA y entrega
Lista de verificación:
- [ ] Sin errores en consola, con y sin WebGL.
- [ ] 360 px, 768 px y 1280 px sin scroll horizontal.
- [ ] En móvil se puede pasar de largo la sección haciendo scroll.
- [ ] Teclado: Tab llega a la lista de planetas y a los controles, con foco visible.
- [ ] Rendimiento: más de 30 fps en un móvil de gama media.
- [ ] Reservar desde un planeta preselecciona el destino.
- [ ] El peso añadido a la página es razonable (Three.js minificado ≈ 600 KB).
- [ ] `PROMPTS.md` y `PLAN.md` actualizados.

---

## 5. Riesgos y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| Three.js es pesado para móviles de gama baja | Carga diferida, resolución limitada, plan B 2D |
| El canvas bloquea el scroll en móvil | Gesto de dos dedos o botón de activación |
| CDN bloqueado o sin internet | Detectar que `THREE` no existe y mostrar el plan B |
| La rúbrica pide "solo Tailwind" | Todo el estilo de la UI en Tailwind; el JS externo solo contiene lógica 3D |
| Escala irreal confunde | Nota visible "Escala artística" |
| Alcance que crece | Fuera de alcance: texturas reales, sonido, física, más lunas |

## 6. Estructura de archivos resultante

```
agencia-espacial/
├── index.html
├── js/
│   └── sistema-solar.js
├── PLAN.md
├── PLAN-3D.md        ← este documento
└── PROMPTS.md
```

## 7. Decisiones pendientes (a confirmar antes de construir)
1. ¿Solo los 3 destinos de la agencia o todo el sistema solar? *(Recomendado: todo el sistema, con los 3 destinos resaltados.)*
2. ¿Texturas procedurales (más rápido, sin archivos) o imágenes reales? *(Recomendado: procedurales.)*
3. ¿Se acepta mover el JS a `js/sistema-solar.js`? *(Recomendado: sí.)*
