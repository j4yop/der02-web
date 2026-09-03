# der02-web

Next.js + TypeScript + Tailwind v4 frontend for [der02](https://github.com/j4yop/der02).

The FastAPI backend is hosted separately at <https://der02.vercel.app>; this app is a pure client of that API.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4** (CSS-based config, no `tailwind.config.js`)
- **react-leaflet 5** + Leaflet 1 for the map
- **lucide-react** for icons
- Hand-rolled shadcn-style UI primitives in `src/components/ui/` (no shadcn CLI install)

## Develop

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app calls the FastAPI at `process.env.NEXT_PUBLIC_DER02_API_URL` (default: `https://der02.vercel.app`).

## Build

```bash
npm run build
npm start
```

## Deploy (Vercel)

1. Create a new Vercel project pointing at this repo.
2. Vercel auto-detects Next.js. No config needed.
3. Add env var `NEXT_PUBLIC_DER02_API_URL` if you're hosting the FastAPI somewhere other than the public one.

## Layout

```
src/
├── app/
│   ├── layout.tsx        # Top-level layout, metadata
│   ├── page.tsx          # Mounts <ZoneExplorer />
│   └── globals.css       # Tailwind import + minimal theme
├── components/
│   ├── ui/               # Button, Card, Slider, Select, Label, Separator
│   └── der02/
│       ├── zone-explorer.tsx  # Main page (controls + map)
│       ├── zone-map.tsx       # Map + zone polygons
│       └── geometry.ts        # Convex hull, severity colours
└── lib/
    ├── api.ts            # Typed client for the FastAPI
    ├── cn.ts             # shadcn-style class merge
    └── types.ts          # Mirrors the FastAPI Pydantic models
```

## License

Same as the parent der02 project: MIT.
