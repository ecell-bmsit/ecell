# E-Cell BMSIT Website

The E-Cell BMSIT website is a React and Vite app with pages for events, the team, alumni, mentors, and the gallery. It also includes interactive event tools and API routes.

## Run locally

Install Node.js, then from the repository root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To check a production build:

```bash
npm run build
npm run preview
```

The Vite development server proxies `/api` requests to `http://localhost:3001`. To run the local backend in a second terminal:

```bash
cd backend
npm ci
cp .env.example .env
npm run dev
```

Fill in the values you need in `backend/.env`. For frontend Supabase features, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in a root `.env` file. Never commit credentials or service-role keys.

## Project layout

- `src/Pages/` contains page components and routes are defined in `src/App.jsx`.
- `src/components/` contains shared UI components, including the preloader and footer.
- `public/` contains static images and other assets served from the site root.
- `api/` contains Vercel API handlers; `backend/` contains the local Express server.
- `vercel.json` defines rewrites, headers, and a scheduled API task.

## Deployment

The frontend builds with `npm run build` and outputs to `dist/`. Configure required environment variables in the deployment project. Vercel deployment access depends on the Git repository's visibility and the Vercel plan; a README change alone does not resolve a blocked deployment from a private organization repository on a Hobby team.
