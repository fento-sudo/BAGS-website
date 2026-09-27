import raw from '../data/books.yaml?raw';
import yaml from 'js-yaml';

export const CATEGORIES = [
  {
    slug: 'soft-fiction',
    name: 'Soft Fiction',
    intro:
      "Books that entertain without asking much in return. They're the page-turners you finish in a weekend and hand to someone at the next meeting.",
    detail:
      'Expect crime, romance, comedy and easy-going literary fiction, each listed with the member who brought it and what they made of it.',
  },
  {
    slug: 'hard-fiction',
    name: 'Hard Fiction',
    intro:
      'Fiction that pushes back. These books challenge the mind, bend the rules, and usually take up most of the evening.',
    detail:
      "Expect literary and experimental novels and stories that don't resolve neatly, each listed with the member who brought it and what they made of it.",
  },
  {
    slug: 'soft-non-fiction',
    name: 'Soft Non-Fiction',
    intro:
      'True stories, told well. This is narrative non-fiction, memoir, and the kind of history that reads like a novel.',
    detail:
      'Expect memoir, biography, travel writing and popular history, each listed with the member who brought it and what they made of it.',
  },
  {
    slug: 'hard-non-fiction',
    name: 'Hard Non-Fiction',
    intro:
      'Dense, demanding and full of ideas. The select few who read these will happily explain them to you.',
    detail:
      'Expect history, science, economics, philosophy and big ideas, each listed with the member who brought it and what they made of it.',
  },
];

const SLUGS = new Set(CATEGORIES.map((c) => c.slug));
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const parsed = yaml.load(raw) || [];

// Fail the build loudly on a typo rather than publishing a broken shelf.
parsed.forEach((b, i) => {
  const where = `books.yaml entry ${i + 1} (${b && b.title})`;
  if (!b || !b.title) throw new Error(`${where}: missing title`);
  if (!b.brought_by) throw new Error(`${where}: missing brought_by`);
  if (!/^\d{4}-\d{2}$/.test(String(b.meeting))) throw new Error(`${where}: meeting must look like "2026-04"`);
  if (!SLUGS.has(b.category)) throw new Error(`${where}: unknown category "${b.category}"`);
});

// Newest meeting first; within a meeting, keep the order they were written.
export const books = parsed
  .map((b, i) => ({ ...b, meeting: String(b.meeting), _i: i }))
  .sort((a, b) => (a.meeting === b.meeting ? a._i - b._i : a.meeting < b.meeting ? 1 : -1));

export function categoryName(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function meetingLabel(ym) {
  const [y, m] = ym.split('-');
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export function countIn(slug) {
  return books.filter((b) => b.category === slug).length;
}

export function groupByMeeting(list) {
  const groups = [];
  for (const b of list) {
    let g = groups[groups.length - 1];
    if (!g || g.meeting !== b.meeting) {
      g = { meeting: b.meeting, label: meetingLabel(b.meeting), books: [] };
      groups.push(g);
    }
    g.books.push(b);
  }
  return groups.map((g) => ({
    ...g,
    members: new Set(g.books.map((b) => b.brought_by)).size,
    changedHands: g.books.filter((b) => b.changed_hands).length,
  }));
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}
