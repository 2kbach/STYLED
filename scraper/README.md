# Boulevard Scraper for STYLED

Scrapes client data from Boulevard (dashboard.boulevard.io) and pushes it to STYLED.

## Setup on the always-on Mac

```bash
cd scraper
npm install
npx playwright install chromium
```

Create `.env`:
```
BLVD_EMAIL=meg.homsey@gmail.com
BLVD_PASSWORD=your-boulevard-password
BLVD_PROVIDER=Meg Auerbach
STYLED_API_URL=https://styled.megandkev.co
STYLED_SCRAPER_KEY=82a90fb47ae6940bf11f8d395573fa9aede2b5624f63702b9e6a194a2560d4a7
```

## Run

```bash
# Dry run (scrapes but doesn't push to STYLED)
npm run scrape:dry

# Full run (scrapes and pushes)
npm run scrape
```

## What it scrapes per client
- Name, phone, email
- Client notes
- Appointment history (date, services, status)
- Order details (services with prices, gratuity, payment method, total)

## Cron (optional)
Run weekly to pick up new appointments:
```bash
crontab -e
# Add: 0 3 * * 0 cd /path/to/STYLED/scraper && node scrape.js >> scrape.log 2>&1
```
