# MobileProgramingProject

## Environment setup

Copy each `.env.example` to `.env` in its project folder and fill in the values:

- `my-app/.env.example` for Firebase, optional Google sign-in, and the Express API URL.
- `backend-express/.env.example` for the database connection and Express port.

Keep `.env` files private; only commit the `.env.example` templates. `EXPO_PUBLIC_*`
values are bundled into the client app and are not secrets. Never put database
credentials or private server keys in `my-app/.env` or any `EXPO_PUBLIC_*` variable.

## Firebase leaderboard deployment

The all-time leaderboard publishes only a player's display name and points. Point
awards, story purchases, profile initialization, and public leaderboard writes are
handled by Firebase Cloud Functions; Firestore rules deny clients direct writes to
account scores and leaderboard entries. All-time ranking uses lifetime points
earned, so spending wallet points on a story doesn't lower a player's rank.

The Firebase project must have billing enabled to deploy Cloud Functions. From the
repository root, install/test the function package, deploy the functions, then
publish the stricter Firestore rules:

```powershell
Set-Location functions
npm install
npm test
Set-Location ..
npx firebase-tools deploy --only functions
npx firebase-tools deploy --only firestore:rules
```

`.firebaserc` selects the app's Firebase project. Change its project alias only if
you intend to deploy to a different Firebase project. The app displays the top 50
all-time scores; weekly and monthly score totals are not currently tracked.