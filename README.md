# bookandginsociety.com

The Book and Gin Society website. Astro static site, hosted on Vercel, signups to MailerLite.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # what Vercel runs; fails loudly if books.yaml has a typo
```

## Add a book

```bash
npm run add-book
```

Type the title, pick the author Open Library suggests (or type it), then answer the prompts.
It appends to `src/data/books.yaml`. Commit and push, and Vercel republishes.
You can also edit `books.yaml` by hand; the format is at the top of the file.

## Where things live

| What | File |
|---|---|
| Books | `src/data/books.yaml` |
| Category names and intros | `src/lib/books.js` |
| MailerLite form, contact email | `src/site.config.js` |
| Colours, type, layout | `src/styles/global.css` |
| AI search summary | `public/llms.txt` |

## Pre-launch checklist

### Design
- [ ] Headline and "Browse the shelf" visible without scrolling on a phone
- [ ] Cobalt only on things you can click
- [ ] No placeholder text anywhere (search the built site for `[` and `TODO`)

### Copy
- [ ] Headline matches the hook in the Copy Pack
- [ ] April 2026: categories confirmed, Feynman warning confirmed, two missing authors filled in
- [ ] Every member named on the shelf is happy with their first name and verdict being public
- [ ] Success message on the signup form confirmed (marked `COPY TO CONFIRM` in `src/layouts/Base.astro`)

### Function
- [ ] Signed up to The Minutes with your own email, and it landed in the MailerLite group
- [ ] If MailerLite double opt-in is on, the confirmation email arrived
- [ ] Contact email set in `src/site.config.js`
- [ ] Privacy page replaced with a Privacy Act 2020 template

### Hosting
- [ ] Deployed on Vercel from GitHub
- [ ] bookandginsociety.com and www both point at Vercel, HTTPS working
- [ ] Vercel Web Analytics switched on
- [ ] Sitemap (`/sitemap-index.xml`) submitted in Google Search Console
- [ ] `/llms.txt` loads
