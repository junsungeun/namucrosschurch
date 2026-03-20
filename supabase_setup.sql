-- namucard 테이블 셋업
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행

CREATE TABLE IF NOT EXISTS cardsets (
  id            uuid primary key default gen_random_uuid(),
  date          text,
  title         text not null,
  series        text,
  scripture     text,
  summary       text,
  youtube_url   text,
  template_id   text,
  format        text,
  cards_data    jsonb,
  card_urls     text[],
  created_at    timestamptz default now()
);

CREATE TABLE IF NOT EXISTS templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  thumbnail_url text,
  bg_image_url  text,
  format        text,
  text_areas    jsonb,
  active        boolean default true,
  bg_color      text default '#2D5A3D',
  text_color    text default '#FFFFFF',
  created_at    timestamptz default now()
);
