-- Migration PIN login (si tu avais l'ancienne version avec auth.users)
-- Remplace YOUR_USER_ID par la valeur de CONTROL_TOWER_USER_ID dans .env.local

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

drop trigger if exists on_auth_user_created_control_tower on auth.users;
drop function if exists public.control_tower_handle_new_user();

-- Exemple (décommente et adapte l'UUID) :
-- insert into public.profiles (id, email)
-- values ('00000000-0000-4000-8000-000000000001', 'local@control-tower')
-- on conflict (id) do nothing;
