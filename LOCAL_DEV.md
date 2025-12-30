# Local Development

## Prerequisites

This project requires **Node.js v24**. Use `fnm` to switch versions:

```bash
eval "$(fnm env)" && fnm use 24
```

## Initial Setup (first time only)

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Build development bundle
npm run build-dev

# Initialize the database
./packages/devenv/lib/initdb.ts
```

## Configuration

Create a `.env` file in the project root:

```
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./keybr.db
APP_URL=http://localhost:3000/
```

## Starting the Server

```bash
eval "$(fnm env)" && fnm use 24 && npm start
```

The app will be available at **http://localhost:3000**

## Development with Auto-Rebuild

For active development, run the watch command in a separate terminal:

```bash
eval "$(fnm env)" && fnm use 24 && npm run watch
```

This will automatically rebuild when you make changes.

## Test Account

Visit http://localhost:3000/login/xyz to log in with an example account.

