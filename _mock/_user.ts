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
  'POST /login/account': (req: MockRequest) => {
    const data = req.body;
    if (!(data.userName === 'admin' || data.userName === 'user') || data.password !== 'ng-alain.com') {
      return { msg: 'نام کاربری یا گذرواژه نامعتبر است (admin / ng-alain.com)' };
    }
    return {
      msg: 'ok',
      user: {
        token: '123456789',
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
