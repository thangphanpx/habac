create table if not exists users (
  id serial primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'editor', 'support')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  id text primary key, -- sha256 của token trong cookie
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create table if not exists services (
  id serial primary key,
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  image text not null,
  intro text not null,
  description text not null,
  scope jsonb not null default '[]',
  position int not null default 0,
  published boolean not null default true
);
create table if not exists products (
  id serial primary key,
  slug text not null unique,
  title text not null,
  use_text text not null,
  body text not null,
  criteria jsonb not null default '[]',
  image text not null default '/assets/images/pumps.webp',
  position int not null default 0,
  published boolean not null default true
);
create table if not exists projects (
  id serial primary key,
  title text not null,
  description text not null default '',
  image text not null,
  category text not null check (category in ('water', 'equipment', 'construction')),
  position int not null default 0,
  published boolean not null default true
);
create table if not exists inquiries (
  id serial primary key,
  name text not null,
  phone text not null,
  email text not null default '',
  topic text not null,
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists inquiries_status_idx on inquiries (status, created_at desc);
create table if not exists settings (
  key text primary key,
  value text not null
);
