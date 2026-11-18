-- ຮູບໂປຣໂມຊັນ (ป๊อปอัปรูปโปรโมทตอนเข้าเว็บ) สูงสุด 10 รูป
-- (รันไปแล้วบนโปรเจกต์ Supabase ของคุณในชื่อ migration: site_promos — ไฟล์นี้เก็บไว้เป็นสำเนา)
create table if not exists public.site_promos (
  id   bigint generated always as identity primary key,
  url  text not null check (length(url) between 1 and 2000),
  sort int  not null default 0
);
alter table public.site_promos enable row level security;
revoke all on table public.site_promos from anon, authenticated;

create or replace function public.shop_promos()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'url', url) order by sort, id), '[]'::jsonb)
  from public.site_promos;
$$;

create or replace function public.admin_promos_save(p_token text, p_items jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare r jsonb; it jsonb; n int := 0; u text;
begin
  r := (public.member_is_admin(p_token))::jsonb;
  if not coalesce((r->>'admin')::boolean, false) then return jsonb_build_object('ok', false, 'code', 'not_admin'); end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then return jsonb_build_object('ok', false, 'code', 'bad_items'); end if;
  if jsonb_array_length(p_items) > 10 then return jsonb_build_object('ok', false, 'code', 'too_many'); end if;
  for it in select * from jsonb_array_elements(p_items) loop
    u := trim(coalesce(it->>'url', ''));
    if length(u) < 8 or length(u) > 2000 or u !~* '^https?://' or u ~ '[[:cntrl:][:space:]]' then
      return jsonb_build_object('ok', false, 'code', 'bad_url');
    end if;
  end loop;
  delete from public.site_promos where true;
  for it in select * from jsonb_array_elements(p_items) loop
    n := n + 1;
    insert into public.site_promos (url, sort) values (trim(it->>'url'), n);
  end loop;
  return jsonb_build_object('ok', true, 'count', n, 'items', public.shop_promos());
end $$;

grant execute on function public.shop_promos() to anon, authenticated;
grant execute on function public.admin_promos_save(text, jsonb) to anon, authenticated;
