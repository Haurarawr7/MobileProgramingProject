# MobileProgramingProject

## Environment setup

Copy each `.env.example` to `.env` in its project folder and fill in the values:

- `my-app/.env.example` for Firebase, optional Google sign-in, and the Express API URL.
- `backend-express/.env.example` for the database connection and Express port.

Keep `.env` files private; only commit the `.env.example` templates. `EXPO_PUBLIC_*`
values are bundled into the client app and are not secrets. Never put database
credentials or private server keys in `my-app/.env` or any `EXPO_PUBLIC_*` variable.