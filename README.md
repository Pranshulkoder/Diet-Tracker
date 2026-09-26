# Diet Tracker

Habit and diet tracker built with React, Vite, Express, and TypeScript.

## Requirements

- Node.js 18 or later
- npm
- A groq API key if you want the AI features to use live responses

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   - Copy [.env.example](./.env.example) to [.env.local](./.env.local)
   - Set `Groq_API_KEY` to your Grok API key

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app in your browser at `http://localhost:3000`

If you do not provide `GROK_API_KEY`, the app still runs and uses local fallback behavior for AI-powered features.

## Production Build

To create a production build:

```bash
npm run build
```

This creates a bundled frontend in `dist/` and a Node server bundle at `dist/server.cjs`.

To run the production build locally:

```bash
npm start
```

## Scripts

- `npm run dev` - Start the app in development mode
- `npm run build` - Build the frontend and server for production
- `npm start` - Run the production server from `dist/server.cjs`
- `npm run lint` - Type-check the project with `tsc --noEmit`
- `npm run clean` - Remove generated build output

## Deployment Notes

- The server reads `PORT` from the environment and falls back to `3000` locally.
- Set `Groq_API_KEY` in your deployment platform’s secret or environment settings.
- `APP_URL` is listed in [.env.example](./.env.example) for future use, but it is not currently required by the app.


working link of project : 'https://diet-tracker-lime-xi.vercel.app/'
