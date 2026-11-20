# MobileProgramingProject

## Environment setup

Copy each `.env.example` to `.env` in its project folder and fill in the values:

- `my-app/.env.example` for Firebase, optional Google sign-in, and the Express API URL.
- `backend-express/.env.example` for the database connection and Express port.

Keep `.env` files private; only commit the `.env.example` templates. `EXPO_PUBLIC_*`
values are bundled into the client app and are not secrets. Never put database
credentials or private server keys in `my-app/.env` or any `EXPO_PUBLIC_*` variable.

## Firebase Spark setup

The app uses Firebase Authentication and Firestore directly; it does not require
Cloud Functions or a paid hosting service. Publish the Firestore rules from the
repository root:

```powershell
npx firebase-tools deploy --only firestore:rules
```

The all-time leaderboard publishes only a player's display name and lifetime
points. Rules restrict account and leaderboard writes to the signed-in owner,
limit point changes to fixed one-time rewards, and validate story purchases.
Because the game and score requests run on the player's device, a determined user
can still modify the app or submit allowed reward claims directly. This is a
best-effort setup for a casual leaderboard, not cheat-proof score verification.

`.firebaserc` selects the Firebase project. Confirm it is the intended project
before deploying rules. The leaderboard displays the top 50 all-time scores;
weekly and monthly score totals are not tracked.