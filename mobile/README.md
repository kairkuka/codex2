# Mobile (Expo + React Native Web)

Frontend for Computer Use live execution UI.

## Run in browser

```bash
cd mobile
npm install
npx expo start --web
```

## API configuration

The app uses `EXPO_PUBLIC_API_BASE_URL` (default: `http://localhost:3001`).

If backend is running on another host, set env var before launch:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<backend-host>:3001 npx expo start --web
```

Or create `.env` in `mobile/`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<backend-host>:3001
```
