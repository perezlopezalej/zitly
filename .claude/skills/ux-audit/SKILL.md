---
name: ux-audit
description: >
  Auditoría de UX y coherencia de navegación del proyecto Zitly. Actívala
  cuando el usuario pida revisar la experiencia de usuario, detectar flujos
  rotos, validar accesibilidad básica o comprobar consistencia de mensajes y
  navegación antes de un lanzamiento o PR importante.
trigger: "ux audit" | "ux review" | "auditoría de ux" | "revisar ux" | "revisar navegación"
---

# UX Audit Skill

## Regla fundamental

> **Listar todos los findings primero.** Nunca modificar ningún archivo hasta que el usuario confirme qué fixes aplicar y en qué orden.

## Proceso

1. Leer todas las páginas, layouts, componentes y actions relevantes bajo `src/`.
2. Recorrer el checklist completo y registrar cada finding.
3. Presentar el informe en la tabla de output.
4. **Esperar confirmación** del usuario antes de tocar ningún archivo.
5. Aplicar los fixes en orden: Critical → High → Medium → Low.

---

## Checklist

### 1. Navegación

- [ ] Todos los `<Link href="...">` apuntan a rutas que existen en `src/app/`.
- [ ] Los logos y elementos de marca tienen `<Link href="/">` o al home correspondiente.
- [ ] Los botones de tipo `button` (no `submit`) tienen un `onClick` que hace algo; no existe ningún botón decorativo sin acción.
- [ ] La sidebar/nav activa visualmente el ítem de la ruta actual (clase active, aria-current, etc.).
- [ ] Los ítems de nav que aún no tienen página detrás están deshabilitados o marcados como "próximamente", no como links rotos.
- [ ] Los links externos (`http://...`) usan `target="_blank" rel="noopener noreferrer"`.

### 2. Estado de sesión

- [ ] La UI refleja correctamente si el usuario está autenticado: el layout del dashboard nunca es accesible sin sesión, y el layout público nunca muestra datos de negocio.
- [ ] El botón/enlace de "Cerrar sesión" solo aparece cuando hay sesión activa.
- [ ] El nombre del negocio u otros datos personalizados se cargan dinámicamente y no están hardcodeados.
- [ ] Si la sesión expira mientras el usuario está en el dashboard, la siguiente acción redirige a login con un mensaje explicativo (o al menos sin error genérico).

### 3. Flujos incompletos

- [ ] Toda página de detalle o flujo secundario tiene un mecanismo de volver (botón ←, breadcrumb o link explícito).
- [ ] Toda lista o sección de datos tiene un **empty state** explícito cuando no hay elementos — no dejar espacio en blanco ni `undefined`.
- [ ] Los formularios deshabilitan el botón de submit mientras la acción está en curso (`pending`) para evitar envíos dobles.
- [ ] Las acciones destructivas (borrar empleado, borrar servicio) tienen confirmación antes de ejecutarse.
- [ ] Tras completar un flujo (reserva creada, servicio guardado), el usuario recibe feedback claro y sabe cuál es el siguiente paso.
- [ ] No hay páginas cul-de-sac: toda pantalla tiene al menos una salida navegable.

### 4. Mensajes al usuario

- [ ] Los mensajes de error son accionables: indican qué falló y cómo corregirlo, no solo "Error al guardar".
- [ ] Las acciones exitosas tienen confirmación visual (toast, mensaje inline, cambio de estado) — el silencio tras guardar es confuso.
- [ ] Los estados de carga tienen feedback visible (spinner, skeleton, botón en estado `disabled` con texto "Guardando…").
- [ ] Los mensajes de error desaparecen o se actualizan cuando el usuario corrige el input, no permanecen estáticos.
- [ ] Los placeholders de inputs son descriptivos (ejemplo real del formato esperado), no solo el nombre del campo repetido.
- [ ] Los mensajes no mezclan idiomas: si la app está en español, todos los textos visibles al usuario están en español.

### 5. Consistencia

- [ ] El mismo concepto usa el mismo término en toda la app (escoger entre "reserva", "cita" o "booking" y usarlo siempre).
- [ ] Los colores de estado son consistentes entre páginas: si "pendiente" es amarillo en reservas, es amarillo en el dashboard.
- [ ] Los CTAs con la misma función tienen el mismo label (no "Confirmar" en un sitio y "Aceptar" en otro para la misma acción).
- [ ] Los formularios siguen la misma estructura: label arriba, input, mensaje de error abajo.
- [ ] Los botones primarios, secundarios y destructivos tienen estilos distintos y consistentes en toda la app.
- [ ] El tono de los textos es consistente: formal o cercano, pero no mezclado según la página.

### 6. Mobile

- [ ] Los elementos marcados `hidden md:block` (o equivalentes) tienen una alternativa visible en móvil o su ausencia es intencionada y no rompe el flujo.
- [ ] Los botones y elementos táctiles tienen un área mínima de 44×44 px (WCAG 2.5.5).
- [ ] Los textos no se truncan ocultando información crítica (precio, nombre de cliente, estado).
- [ ] Las tablas o grids con muchas columnas tienen scroll horizontal o se reordenan en móvil.
- [ ] La navegación mobile es accesible sin necesitar zoom (bottom nav, hamburger o sidebar deslizante).
- [ ] Los inputs no disparan zoom en iOS (font-size ≥ 16px o `touch-action` correcta).

### 7. Accesibilidad básica

- [ ] Todas las imágenes (`<img>`, `next/image`) tienen `alt` descriptivo; las decorativas tienen `alt=""`.
- [ ] Todos los botones tienen contenido textual o `aria-label` — ningún botón es solo un icono sin descripción.
- [ ] Todos los inputs tienen una `<label>` asociada (via `for`/`id` o envolviendo el input).
- [ ] Los links con texto genérico ("ver más", "aquí") tienen `aria-label` que describe el destino.
- [ ] Los formularios marcan los campos requeridos con `required` y lo indican visualmente (asterisco u otro indicador explicado).
- [ ] El contraste de texto sobre fondo cumple WCAG AA: mínimo 4.5:1 para texto normal, 3:1 para texto grande (≥ 18px bold o ≥ 24px normal).
- [ ] El orden de tabulación (`Tab`) sigue el orden visual lógico; no hay trampas de foco.
- [ ] Los modales y desplegables devuelven el foco al elemento que los abrió al cerrarse.

---

## Formato de output

Presenta los findings como tabla antes de aplicar ningún cambio:

```
| Página / Componente | Problema | Severidad | Fix sugerido |
|---------------------|----------|-----------|--------------|
| /dashboard/employees — EmployeesClient.tsx | El botón "Eliminar" borra sin confirmación previa | High | Añadir dialog de confirmación antes de llamar a deleteEmployeeAction |
| /book/[businessId] — BookingFlow.tsx | Spinner de carga ausente al enviar reserva | Medium | Deshabilitar botón submit y mostrar "Enviando…" mientras pending=true |
| AuthShell.tsx | Logo "Zitly" en panel izquierdo sin enlace | Low | Envolver en <Link href="/"> |
```

### Niveles de severidad

| Nivel | Criterio | Bloquea release |
|-------|----------|-----------------|
| **Critical** | Flujo completamente roto, usuario bloqueado sin salida, datos erróneos mostrados | Sí |
| **High** | Acción destructiva sin confirmación, estado de carga ausente en operación crítica, empty state que rompe layout | Sí |
| **Medium** | Mensaje de error genérico, falta de feedback de éxito, truncado de información clave en móvil | No (recomendado) |
| **Low** | Inconsistencia de texto, label de accesibilidad ausente en elemento decorativo, placeholder mejorable | No |

---

## Notas de stack

- En Next.js 16 App Router, los Server Components no tienen estado — los estados de carga se implementan en Client Components con `useTransition` o `useFormStatus`.
- Los Server Actions devuelven `ActionResult = { error: string } | undefined`; el componente cliente debe leer `result?.error` y mostrarlo, nunca silenciarlo.
- `revalidatePath` invalida el caché pero no produce feedback visual por sí solo — el componente necesita mostrar un mensaje de éxito explícito.
- Tailwind CSS v4: los breakpoints `sm:`, `md:`, `lg:` siguen el sistema de mobile-first; revisar que los `hidden` y `block` alternen correctamente entre tamaños.
- Los tokens de color de marca (`brand-green`, `brand-muted`, etc.) están definidos en `globals.css` — usarlos en lugar de colores hardcodeados para mantener consistencia si se cambia el tema.
- `next/link` pre-fetcha rutas al hover; un `href` a una ruta inexistente causará un 404 que puede detectarse manualmente o con `npm run build` (Next.js lista las páginas generadas).
