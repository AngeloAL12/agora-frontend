# Agora Frontend

Aplicacion frontend de Agora construida con Expo + React Native + Expo Router.

## Stack

- Expo SDK 54
- React 19
- React Native 0.81
- TypeScript (modo estricto)
- Expo Router (enrutamiento por archivos)
- Jest + Testing Library React Native
- ESLint + Prettier
- Husky + lint-staged + commitlint

## Requisitos

- Node.js 20 o superior recomendado
- npm 10 o superior
- Xcode (para iOS Simulator en macOS)
- Android Studio (para Android Emulator)

## Instalacion

```bash
npm install
```

## Ejecucion local

Inicia el servidor de desarrollo:

```bash
npm run start
```

Atajos principales:

```bash
npm run android
npm run ios
npm run web
```

Tambien puedes abrir con Expo Go desde el QR que aparece en consola.

## Scripts disponibles

| Script               | Descripcion                                 |
| -------------------- | ------------------------------------------- |
| `npm run start`      | Levanta Metro/Expo en modo desarrollo       |
| `npm run android`    | Abre la app en emulador Android             |
| `npm run ios`        | Abre la app en iOS Simulator                |
| `npm run web`        | Ejecuta la app en navegador                 |
| `npm run test`       | Ejecuta pruebas unitarias con Jest          |
| `npm run test:watch` | Ejecuta pruebas en modo watch               |
| `npm run lint`       | Ejecuta linter (Expo + reglas del proyecto) |
| `npm run lint:fix`   | Corrige problemas de lint automaticamente   |
| `npm run format`     | Formatea el codigo con Prettier             |

## Calidad de codigo

Este repositorio tiene automatizaciones de calidad con Husky:

- `pre-commit`: corre `lint-staged`
- `commit-msg`: valida el mensaje con commitlint (`@commitlint/config-conventional`)
- `pre-push`: ejecuta `npm test`

Esto significa que antes de subir cambios se verifican pruebas y convencion de commits.

## Testing y cobertura

Las pruebas usan `jest-expo` y `@testing-library/react-native`.

Ejecutar pruebas:

```bash
npm run test
```

Cobertura minima configurada globalmente:

- Branches: 70%
- Functions: 70%
- Lines: 80%
- Statements: 70%

El reporte de cobertura se genera en la carpeta `coverage`.

## Estructura principal

```text
agora-frontend/
├── app/                 # Pantallas y rutas (Expo Router)
│   ├── _layout.tsx
│   └── index.tsx
├── __tests__/           # Pruebas unitarias
├── assets/              # Imagenes e iconos
├── app.json             # Configuracion Expo
├── eslint.config.js     # Configuracion de ESLint
├── commitlint.config.js # Reglas de commits
├── tsconfig.json        # TypeScript + paths
└── package.json         # Scripts y dependencias
```

## Convenciones del proyecto

- Rutas basadas en archivos dentro de `app`
- Alias de importacion `@/*` configurado en TypeScript
- Formato y estilo forzados por ESLint + Prettier

## Troubleshooting rapido

Si Metro queda en estado inconsistente:

```bash
npx expo start -c
```

Si cambias dependencias nativas, reinicia simulador/emulador y vuelve a levantar Expo.
