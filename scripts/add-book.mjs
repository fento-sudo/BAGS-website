#!/usr/bin/env node
// Add a book to the shelf. Type the title; Open Library suggests the author.
// Usage: npm run add-book
import { readFile, appendFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import yaml from 'js-yaml';

const FILE = new URL('../src/data/books.yaml', import.meta.url);
const CATS = ['soft-fiction', 'hard-fiction', 'soft-non-fiction', 'hard-non-fiction'];
const rl = createInterface({ input, output });
const ask = async (q, def = '') => {
  const a = (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim();
  return a || def;
};
const yes = async (q) => /^y/i.test(await ask(`${q} (y/n)`, 'n'));

async function suggestAuthors(title) {
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5&fields=title,author_name,first_publish_year`;
    const res = await fetch(url, { headers: { 'User-Agent': 'bookandginsociety.com shelf tool' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs || [])
      .filter((d) => d.author_name && d.author_name.length)
      .map((d) => ({ title: d.title, author: d.author_name.join(', '), year: d.first_publish_year }));
  } catch {
    return [];
  }
}

const now = new Date();
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const title = await ask('Title');
if (!title) { console.log('No title, nothing added.'); process.exit(0); }

let author = '';
const matches = await suggestAuthors(title);
if (matches.length) {
  console.log('\nOpen Library suggests:');
  matches.forEach((m, i) => console.log(`  ${i + 1}. ${m.title} by ${m.author}${m.year ? ` (${m.year})` : ''}`));
  const pick = await ask('Pick a number, or type the author yourself (blank to skip)');
  author = /^\d+$/.test(pick) && matches[Number(pick) - 1] ? matches[Number(pick) - 1].author : pick;
} else {
  console.log('No match found. Type the author, or leave it blank to fill in later.');
  author = await ask('Author');
}

const brought_by = await ask('Brought by');
const meeting = await ask('Meeting (YYYY-MM)', thisMonth);
console.log('Category: 1 Soft Fiction, 2 Hard Fiction, 3 Soft Non-Fiction, 4 Hard Non-Fiction');
let cat = '';
while (!cat) {
  const c = await ask('Category number');
  cat = CATS[Number(c) - 1] || '';
}
const note = await ask('Their verdict, in their words (optional)');
const warning = await yes('Brought as a warning?');
const changed_hands = await yes('Changed hands?');
rl.close();

const entry = { title, author, brought_by, meeting, category: cat };
if (note) entry.note = note;
if (warning) entry.warning = true;
if (changed_hands) entry.changed_hands = true;

const current = await readFile(FILE, 'utf8');
const block = yaml.dump([entry], { quotingType: '"', forceQuotes: false }).replace(/meeting: '?(\d{4}-\d{2})'?/, 'meeting: "$1"');
await appendFile(FILE, `${current.endsWith('\n') ? '' : '\n'}\n${block}`);
console.log(`\nAdded "${title}" to the shelf. Commit and push to publish it.`);
