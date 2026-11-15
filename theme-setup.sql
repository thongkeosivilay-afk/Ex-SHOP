-- ธีมสีเว็บไซต์ (สีหลัก / สีพื้นหลัง / โหมดธีม) — แถวเดียว id = 1
-- (รันไปแล้วบนโปรเจกต์ Supabase ของคุณในชื่อ migration: add_site_theme_color_settings — ไฟล์นี้เก็บไว้เป็นสำเนา)
create table if not exists public.site_theme (
  id         integer primary key default 1 check (id = 1),
  color      text not null default '#ff0000' check (color ~* '^#[0-9a-f]{6}$'),
  bg         text not null default '#000000' check (bg    ~* '^#[0-9a-f]{6}$'),
  mode       text not null default 'solid'   check (mode in ('solid','gradient','glow')),
  updated_at timestamptz not null default now()
);
alter table public.site_theme enable row level security;
revoke all on table public.site_theme from anon, authenticated;
insert into public.site_theme (id) values (1) on conflict (id) do nothing;

create or replace function public.shop_theme()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'color', coalesce((select color from public.site_theme where id = 1), '#ff0000'),
    'bg',    coalesce((select bg    from public.site_theme where id = 1), '#000000'),
    'mode',  coalesce((select mode  from public.site_theme where id = 1), 'solid'));
$$;

create or replace function public.admin_theme_update(p_token text, p_color text, p_bg text, p_mode text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare r jsonb; c text := lower(trim(coalesce(p_color, ''))); b text := lower(trim(coalesce(p_bg, ''))); m text := lower(trim(coalesce(p_mode, '')));
begin
  r := (public.member_is_admin(p_token))::jsonb;
  if not coalesce((r->>'admin')::boolean, false) then return jsonb_build_object('ok', false, 'code', 'not_admin'); end if;
  if c !~ '^#[0-9a-f]{6}$' then return jsonb_build_object('ok', false, 'code', 'bad_color'); end if;
  if b !~ '^#[0-9a-f]{6}$' then return jsonb_build_object('ok', false, 'code', 'bad_bg'); end if;
  if m not in ('solid','gradient','glow') then return jsonb_build_object('ok', false, 'code', 'bad_mode'); end if;
  insert into public.site_theme (id, color, bg, mode, updated_at) values (1, c, b, m, now())
    on conflict (id) do update set color = excluded.color, bg = excluded.bg, mode = excluded.mode, updated_at = now();
  return jsonb_build_object('ok', true, 'color', c, 'bg', b, 'mode', m);
end $$;

grant execute on function public.shop_theme() to anon, authenticated;
grant execute on function public.admin_theme_update(text, text, text, text) to anon, authenticated;
