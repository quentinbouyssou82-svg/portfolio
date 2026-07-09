-- Maison — RLS : accès serveur uniquement (service_role)
-- L'app n'utilise PAS auth.users. Toute la sécurité passe par session cookie + API serveur.

alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.preferences enable row level security;
alter table public.meal_plans enable row level security;
alter table public.grocery_lists enable row level security;
alter table public.budgets enable row level security;

-- Aucune policy = anon/authenticated bloqués. service_role bypass RLS.
