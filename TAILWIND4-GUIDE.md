# 🚀 Guía de Instalación Rápida - Tailwind CSS 4

## Cambios importantes de Tailwind 3 → Tailwind 4

### 1. globals.css
**Antes (Tailwind 3):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Ahora (Tailwind 4):**
```css
@import "tailwindcss";

@theme {
  --color-primary-500: #00a8a8;
}
```

### 2. tailwind.config.ts
**Antes (Tailwind 3):**
```js
module.exports = {
  theme: {
    extend: { ... }
  }
}
```

**Ahora (Tailwind 4):**
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
```

### 3. postcss.config.js
**Antes (Tailwind 3):**
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Ahora (Tailwind 4):**
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

**Nota:** Usa `module.exports` (CommonJS), NO `export default` (ES modules).

### 4. package.json
**Antes (Tailwind 3):**
```json
"devDependencies": {
  "tailwindcss": "^3.4.3",
  "autoprefixer": "^10.4.19",
  "postcss": "^8.4.38"
}
```

**Ahora (Tailwind 4):**
```json
"devDependencies": {
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0"
}
```

## 📦 Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo
pnpm dev
```

## ⚠️ Solución de Problemas

### Error: "Your custom PostCSS configuration must export a `plugins` key"
- **Causa**: El archivo `postcss.config.js` usa sintaxis ES modules en lugar de CommonJS
- **Solución**: Asegúrate de que `postcss.config.js` use `module.exports`:
```js
// ✅ Correcto
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

// ❌ Incorrecto
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Error: "The `X` class does not exist"
- **Causa**: Tailwind 4 usa `@import "tailwindcss"` en lugar de `@tailwind`
- **Solución**: Verifica que `globals.css` use la sintaxis correcta de Tailwind 4

### Error: "Cannot find module '@tailwindcss/postcss'"
- **Causa**: Falta el plugin de PostCSS de Tailwind 4
- **Solución**: 
```bash
pnpm add -D @tailwindcss/postcss
```

### Los gradientes no funcionan
- **Causa**: Tailwind 4 requiere gradientes personalizados como estilos inline
- **Solución**: Usa `style={{background: 'linear-gradient(...)'}}` en lugar de clases

## 🎨 Aplicar Gradientes

```tsx
// ✅ Correcto (Tailwind 4)
<div style={{background: 'linear-gradient(180deg, #0a4d4d 0%, #10a8a8 100%)'}}>
  Contenido
</div>

// ❌ Incorrecto (ya no funciona igual)
<div className="bg-gradient-to-b from-teal-900 to-cyan-600">
  Contenido
</div>
```

## 📚 Recursos

- [Documentación oficial de Tailwind CSS 4](https://tailwindcss.com/docs)
- [Guía de migración](https://tailwindcss.com/docs/upgrade-guide)
