# TechSphere — Web Mining Demonstration

## Included
- `site/`: static website with **40 public pages**, shared CSS/JS, `robots.txt`, and `sitemap.xml`.
- `crawler/crawler.py`: Python BFS crawler with same-host limits, robots.txt checks, optional sitemap seeding, page depth, exact text hashing, and CSV/JSON reports.
- `dashboard/index.html`: local CSV report viewer.
- `site/drafts/crawler-test.html` and `site/internal/crawler-notes.html`: test URLs disallowed by robots.txt. They are public, not private.

## Page count
1 homepage + 5 category pages + 30 articles + 4 utility pages = 40 public pages.

## Local preview
Run from the `site` folder:
```bash
python -m http.server 8000
```
Open `http://localhost:8000/`.

## Deploy
Deploy the **contents of `site/`** to Cloudflare Pages or another static host. Replace `YOUR-DOMAIN` in `robots.txt` and `sitemap.xml` with the actual HTTPS hostname. The logo and local fallback font can be added to `site/assets/logo.webp` and `site/fonts/GeistPixel-Circle.woff2`; the page contains a text fallback if the logo is missing. The requested CloudFront video URL is included on the home page.

## Run crawler
```bash
cd crawler
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python crawler.py https://YOUR-DEPLOYED-DOMAIN/ --max-pages 100 --max-depth 8
python crawler.py https://YOUR-DEPLOYED-DOMAIN/ --max-pages 100 --max-depth 8 --use-sitemap
```
Reports are saved to `crawler/reports/`: `crawl_report.csv`, `link_edges.csv`, and `summary.json`. Compare runs using the same settings and report actual results.

## Important
`robots.txt` is a voluntary crawling protocol, not access control. Do not put credentials or private information in disallowed test pages. This is an educational crawler, not a production search engine crawler.
