-- Create the vault table for encrypted personal data
create table if not exists public.vault (
    user_id uuid references auth.users not null default auth.uid(),
    key text not null,
    ciphertext text not null,
    iv text not null,
    salt text not null,
    updated_at timestamp with time zone default now(),
    primary key (user_id, key)
);

-- Enable Row Level Security
alter table public.vault enable row level security;

-- Create policy to allow users to see ONLY their own data
create policy "Users can only access their own data" on public.vault
    for all 
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
