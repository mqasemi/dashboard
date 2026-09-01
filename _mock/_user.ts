import { MockRequest } from '@delon/mock';

/** Shape of a mocked user row; Step 6 replaces this with the real `User` model. */
interface MockUser {
  id: number;
  disabled: boolean;
  avatar: string;
  no: string;
  title: string;
  owner: string;
  description: string;
  callNo: number;
  status: number;
  updatedAt: Date;
  createdAt: Date;
  progress: number;
}

interface MockUserQuery {
  pi?: string;
  ps?: string;
  no?: string;
}

/** Body of `POST /login/account` as sent by the login form. */
interface MockLoginBody {
  userName?: string;
  password?: string;
  captcha?: string;
}

const FIRST_NAMES = ['علی', 'زهرا', 'محمد', 'فاطمه', 'رضا', 'مریم', 'حسین', 'سارا', 'امیر', 'نگار'];
const LAST_NAMES = ['محمدی', 'حسینی', 'رضایی', 'کریمی', 'موسوی', 'احمدی', 'صادقی', 'نوری', 'قاسمی', 'شریفی'];

const list: MockUser[] = [];
const total = 50;

for (let i = 0; i < total; i += 1) {
  list.push({
    id: i + 1,
    disabled: i % 6 === 0,
    avatar: './assets/tmp/img/avatar.jpg',
    no: `USR-${String(i + 1).padStart(4, '0')}`,
    title: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`,
    owner: 'مدیر سیستم',
    description: 'کاربر نمونه برای آزمون فهرست‌ها و فرم‌ها',
    callNo: (i * 37) % 1000,
    status: i % 4,
    // Deterministic dates so the mock output is stable between reloads
    updatedAt: new Date(2026, 0, (i % 28) + 1),
    createdAt: new Date(2025, 5, (i % 28) + 1),
    progress: ((i * 7) % 100) + 1
  });
}

function genData(params: MockUserQuery): { total: number; list: MockUser[] } {
  let ret = [...list];
  const pi = +(params.pi ?? 1);
  const ps = +(params.ps ?? 10);
  const start = (pi - 1) * ps;

  if (params.no) {
    ret = ret.filter(data => data.no.indexOf(params.no!) > -1);
  }

  return { total: ret.length, list: ret.slice(start, ps * pi) };
}

function saveData(id: number, value: Partial<MockUser>): { msg: string } {
  const item = list.find(w => w.id === id);
  if (!item) {
    return { msg: 'کاربر یافت نشد.' };
  }
  Object.assign(item, value);
  return { msg: 'ok' };
}

export const USERS = {
  '/user': (req: MockRequest) => genData(req.queryString as MockUserQuery),
  '/user/:id': (req: MockRequest) => list.find(w => w.id === +req.params.id),
  'POST /user/:id': (req: MockRequest) => saveData(+req.params.id, req.body as Partial<MockUser>),
  '/user/current': {
    name: 'مدیر سیستم',
    avatar: './assets/tmp/img/avatar.jpg',
    userid: '00000001',
    email: 'admin@example.com',
    signature: 'مدیریت یکپارچهٔ سامانه',
    title: 'مدیر ارشد',
    group: 'واحد فناوری اطلاعات',
    tags: [
      { key: '0', label: 'مدیر' },
      { key: '1', label: 'دسترسی کامل' }
    ],
    notifyCount: 12,
    country: 'ایران',
    geographic: {
      province: { label: 'تهران', key: 'THR' },
      city: { label: 'تهران', key: 'THR-01' }
    },
    address: 'تهران، خیابان نمونه، پلاک ۱',
    phone: '021-00000000'
  },
  'POST /user/avatar': 'ok',
  // Captcha: a real API would return an image URL/base64/SVG of its own making; here the SVG is
  // generated in this mock "server" and validated against the last issued code on login.
  '/captcha': () => ({ image: issueCaptcha() }),
  'POST /login/account': (req: MockRequest) => {
    const data = req.body as MockLoginBody;
    if (!data.captcha || String(data.captcha).trim().toUpperCase() !== currentCaptcha) {
      // Rotate the code on every failed attempt, exactly like a real captcha service
      issueCaptcha();
      return { msg: 'کد امنیتی نادرست است.' };
    }
    if (!(data.userName === 'admin' || data.userName === 'user') || data.password !== 'ng-alain.com') {
      return { msg: 'نام کاربری یا گذرواژه نامعتبر است.' };
    }
    return {
      msg: 'ok',
      user: {
        token: 'mock-jwt-token',
        name: data.userName,
        email: `${data.userName}@example.com`,
        id: 10000,
        time: +new Date()
      }
    };
  },
  'POST /register': {
    msg: 'ok'
  }
};

/* ------------------------------------------------------------------ *
 * Captcha simulation                                                  *
 * ------------------------------------------------------------------ */

/**
 * The last code issued by `GET /captcha`. Mirrors the server-side session store a real captcha
 * service keeps; every login attempt is checked against it and every failed attempt rotates it.
 */
let currentCaptcha = '';

/** Unambiguous alphabet: no `O/0`, `I/1`, etc. */
const CAPTCHA_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_LENGTH = 4;
const GLYPH_COLORS = ['#1890ff', '#13c2c2', '#722ed1', '#eb2f96', '#fa8c16'];
const GLYPH_FONTS = ['Courier New', 'Georgia', 'Verdana', 'Tahoma'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

/** Issues a fresh code, remembers it, and returns its distorted SVG rendering. */
function issueCaptcha(): string {
  let code = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i += 1) {
    code += CAPTCHA_ALPHABET[randomInt(0, CAPTCHA_ALPHABET.length - 1)];
  }
  currentCaptcha = code;
  return buildCaptchaSvg(code);
}

function buildCaptchaSvg(code: string): string {
  const width = 120;
  const height = 40;
  const slot = width / (code.length + 1);

  // Noise first so glyphs stay readable on top of it
  let shapes = '';
  for (let i = 0; i < 3; i += 1) {
    shapes += `<line x1="${randomInt(0, width)}" y1="${randomInt(0, height)}" x2="${randomInt(0, width)}" y2="${randomInt(
      0,
      height
    )}" stroke="#d9d9d9" stroke-width="1" opacity="0.8"/>`;
  }
  for (let i = 0; i < 14; i += 1) {
    shapes += `<circle cx="${randomInt(0, width)}" cy="${randomInt(0, height)}" r="1" fill="#bfbfbf" opacity="0.5"/>`;
  }

  let glyphs = '';
  [...code].forEach((char, i) => {
    const x = Math.round(slot * (i + 1) + randomInt(-3, 3));
    const y = Math.round(height / 2 + randomInt(-4, 4));
    const rotate = randomInt(-22, 22);
    const size = randomInt(20, 26);
    glyphs += `<text x="${x}" y="${y}" font-family="${pick(GLYPH_FONTS)}" font-size="${size}" font-weight="700" fill="${pick(
      GLYPH_COLORS
    )}" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#fafafa"/>` +
    `${shapes}${glyphs}</svg>`
  );
}
