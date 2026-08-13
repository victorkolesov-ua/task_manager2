# Task Manager 2

A simple browser-based JavaScript app built with Vite.

## Project overview

This project is a small front-end application for managing tasks in the browser. It uses vanilla JavaScript and Vite for fast local development and build tooling.

## Features

- Fast development server with Vite
- Browser-based UI powered by JavaScript
- Modular ES module structure
- Simple asset and stylesheet setup

## Project structure

```text
.
├── index.html
├── package.json
├── eslint.config.js
├── public/
├── src/
│   ├── main.js
│   ├── counter.js
│   ├── style.css
│   └── assets/
├── .gitignore
├── README.md
└── package-lock.json
```

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Running the app

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Production build

Create a production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## Linting

```bash
npx eslint .
```

## Notes

This project uses ES modules and browser globals such as `document` and `window`, so it is designed for client-side JavaScript execution in the browser.
