# FinFlow — Investment Analytics
React frontend for financial calculations and charts

## Features

- **XIRR Calculator**: Calculate the Extended Internal Rate of Return for investments with irregular cash flows.
- **Average Chart**: Paste lists of numbers or currency values to visualize the series, along with a moving average and the overall mean. Features automatic delimiter detection and chart exporting.

## Stack

- **React 18** — UI
- **Vite 5** — Dev server (HMR) + build
- **React Router v6** — Client-side routing
- **CSS Modules** — Scoped styles, zero runtime cost

---

## Getting Started

### Prerequisites
- Node.js >= 18

### Install

```bash
npm install
```

### Development (with HMR auto-restart)

```bash
npm run dev
```

Opens at `http://localhost:3000/finflow/` with Hot Module Replacement active.

### Production Build

```bash
npm run build
```

Output goes to `dist/`. Files are minified and code-split.

### Preview Production Build Locally

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Deploying to Production

### Vercel / Netlify (zero-config)
Push to GitHub and connect the repo. Both detect Vite automatically.
- Build command: `npm run build`
- Output directory: `dist`

### Nginx (self-hosted)
```nginx
server {
  listen 80;
  root /var/www/finflow/dist;
  index index.html;

  location / {
    try_files $uri $uri/ finflow/index.html;
  }
}
```

### Docker
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # AppLayout, Sidebar, TopBar
│   └── ui/            # Shared UI atoms (NavIcon, …)
├── hooks/             # Custom React hooks (useXIRR, …)
├── pages/
│   └── XIRR/          # XIRR Calculator page + sub-components
├── styles/            # globals.css (CSS variables, resets)
├── utils/             # Pure helpers (xirr.js, …)
├── App.jsx            # Route registry — add new pages here
└── main.jsx           # Entry point
```

## Adding a New Page / Tool

1. Create `src/pages/MyTool/MyToolPage.jsx`
2. Add a route entry in `src/App.jsx`:

```js
import MyToolPage from './pages/MyTool/MyToolPage'

export const NAV_ROUTES = [
  { path: '/xirr',   label: 'XIRR Calculator', icon: 'xirr',   element: <XIRRPage /> },
  { path: '/mytool', label: 'My Tool',          icon: 'dashboard', element: <MyToolPage /> },
]
```

The sidebar and routing update automatically. Add a new icon SVG in `NavIcon.jsx` if needed.

---

## Environment Variables

Create `.env.local` for local overrides (never committed):

```
VITE_APP_TITLE=FinFlow
VITE_API_BASE_URL=https://api.example.com
```

Access in code: `import.meta.env.VITE_APP_TITLE`