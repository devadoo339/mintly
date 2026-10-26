# mintly

Mintly is a financial-learning site for teens (13–18): short lessons, then practice decisions.
Students research a stock, ask Leaf (the AI learning partner) questions, decide whether to
Buy, Sell or Wait, and get a Decision Score. Everything uses practice money.

## Run it locally

Requires Node 18 or newer (the server uses the built-in `fetch`). There are no npm dependencies.

```bash
npm start            # serves the site at http://localhost:8000
```

Open http://localhost:8000. Every page works without a key; the stock price and chart fall back
to mock data and the page says so.

## Live NVDA prices (Alpha Vantage)

`server.js` proxies quotes and charts from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
so the key stays on the server and is never sent to the browser. Get a free key, then:

```bash
ALPHA_VANTAGE_API_KEY=your_key_here npm start
```

Optional settings:

| Variable | What it does |
| --- | --- |
| `ALPHA_VANTAGE_PREMIUM=1` | Premium key: unlocks intraday 1D/1W charts |
| `QUOTE_REFRESH_SECONDS` | How often the server re-fetches the live price (default 3600 on free keys, 10 on premium) |
| `PORT` | Port to serve on (default 8000) |

Never commit a key. If you keep it in a `.env` file, load it yourself (for example
`set -a; . ./.env; set +a; npm start`); `.env` is not served by the site.

API routes: `/api/status` (is a key set?), `/api/quote?symbol=NVDA`, `/api/chart?symbol=NVDA&range=1M`
(`1D` premium only, `1W`, `1M`, `1Y`).

## Pages

- `index.html` home page, `mintly.demo.html` interactive demo
- `pricing.html` (Starter $10, Plus $15, Family Pro $20 per month, School $8 per student per month for 50+ students; billing is not live, choosing a plan creates a demo account)
- `parents.html`, `signin.html` (demo accounts stored only in the browser)
- `lessons/financial-literacy.html` course page with progress, lessons 1–5, `explore.html`,
  locked electives `collectables.html` and `cryptocurrencies.html`
- `tools/device-simulator.html` previews the site in phone frames

To add a lesson, add it to `LESSONS` in `script.js` and to the list in `lessons/financial-literacy.html`.
