# Tower of Hanoi

A tactile, responsive version of the classic Tower of Hanoi puzzle. Move the
entire stack from **Origin** to **Home**, one disk at a time, without ever
placing a larger disk on a smaller one.

[Play the deployed game](https://tower-of-hanoi-play.rmlowe.chatgpt.site)
(sign-in may be required).

## Features

- Five difficulty levels, from 3 to 7 disks
- Move counter and optimal-move target
- Game timer with completion feedback
- Undo and shortest-path hints from any valid position
- Mouse, touch, and keyboard controls
- Responsive layout for desktop and mobile
- Reduced-motion support and accessible status announcements

## How to play

Select a tower to pick up its top disk, then select another tower to place it.
The goal is to move every disk to **Home**.

The three rules are:

1. Move only one disk at a time.
2. Move only the top disk of a tower.
3. Never place a larger disk on a smaller disk.

For a game with `n` disks, the fewest possible moves is `2ⁿ - 1`.

### Keyboard controls

- `←` / `→`: choose a tower
- `Enter` or `Space`: select the tower or complete a move

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
npm run build
```

## Project structure

```text
app/
├── page.tsx       # Game state, rules, hints, and interface
├── globals.css    # Responsive visual design
└── layout.tsx     # Document layout and metadata
```

## Technology

- React 19
- TypeScript
- vinext and Vite
- Cloudflare Workers-compatible deployment

## License

No license has been specified.
