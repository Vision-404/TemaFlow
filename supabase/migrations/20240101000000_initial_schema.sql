-- TeamFlow Database Schema
-- Initial migration with all tables, types, and RLS policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Roles enum
create type role_type as enum ('owner', 'admin', 'member', 'guest');

-- Message type enum
create type message_type as enum ('text', 'file', 'system');

-- Channel type enum
create type channel_type as enum ('public', 'private', 'dm', 'group');

-- Notification type enum
create type notification_type as enum ('message', 'mention', 'reaction', 'channel_joined', 'workspace_invite');

-- Integration type enum
create type integration_type as enum ('slack', 'github', 'google_drive', 'zoom');

-- Users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Organizations table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  owner_id uuid references users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true
);

-- Workspaces table
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  role role_type default 'owner',
  member_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Membership table
create table membership (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  user_id uuid references users(id) not null,
  role role_type default 'member',
  joined_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, organization_id)
);

-- Channels table
create table channels (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) not null,
  name text not null,
  slug text not null,
  description text,
  type channel_type default 'public',
  is_archived boolean default false,
  member_count integer default 0,
  created_by uuid references users(id) not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(workspace_id, slug)
);

-- Channel members table
create table channel_members (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references channels(id) not null,
  user_id uuid references users(id) not null,
  role text default 'member',
  joined_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(channel_id, user_id)
);

-- Messages table
create table messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references channels(id) not null,
  author_id uuid references users(id) not null,
  content text not null default '',
  type message_type default 'text',
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  edited_at timestamp with time zone,
  is_deleted boolean default false
);

-- Reactions table
create table reactions (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references messages(id) not null,
  user_id uuid references users(id) not null,
  emoji text not null,
  created_at timestamp with time zone default now(),
  unique(message_id, user_id, emoji)
);

-- Thread replies table
create table thread_replies (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references messages(id) not null,
  user_id uuid references users(id) not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  edited_at timestamp with time zone,
  is_deleted boolean default false
);

-- Notifications table
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  type notification_type not null,
  title text not null,
  body text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default now(),
  read_at timestamp with time zone
);

-- Files table
create table files (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid references messages(id) not null,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  created_at timestamp with time zone default now()
);

-- Integrations table
create table integrations (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) not null,
  type integration_type not null,
  name text not null,
  config jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_users_email on users(email);
create index idx_organizations_slug on organizations(slug);
create index idx_organizations_owner on organizations(owner_id);
create index idx_workspaces_slug on workspaces(slug);
create index idx_workspaces_organization on workspaces(organization_id);
create index idx_membership_user on membership(user_id);
create index idx_membership_org on membership(organization_id);
create index idx_channels_slug on channels(slug);
create index idx_channels_workspace on channels(workspace_id);
create index idx_messages_channel on messages(channel_id);
create index idx_messages_created on messages(created_at);
create index idx_reactions_message on reactions(message_id);
create index idx_thread_replies_message on thread_replies(message_id);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_read on notifications(is_read);
create index idx_files_message on files(message_id);
create index idx_integrations_workspace on integrations(workspace_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all sensitive tables
alter table users enable row level security;
alter table organizations enable row level security;
alter table workspaces enable row level security;
alter table membership enable row level security;
alter table channels enable row level security;
alter table channel_members enable row level security;
alter table messages enable row level security;
alter table reactions enable row level security;
alter table thread_replies enable row level security;
alter table notifications enable row level security;
alter table files enable row level security;
alter table integrations enable row level security;

-- Users RLS policies
create policy "Users can read own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Organizations RLS policies
create policy "Users can read orgs they belong to" on organizations
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      where m.organization_id = organizations.id
      and m.user_id = auth.uid()
    )
  );

create policy "Users can insert orgs they own" on organizations
  for insert with check (
    auth.uid() = owner_id
  );

create policy "Users can update orgs they belong to" on organizations
  for update using (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      where m.organization_id = organizations.id
      and m.user_id = auth.uid()
    ) and
    (
      auth.uid() = owner_id or
      exists (
        select 1 from membership m
        where m.organization_id = organizations.id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
      )
    )
  );

-- Workspaces RLS policies
create policy "Users can read workspaces they belong to" on workspaces
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      where m.organization_id = workspaces.organization_id
      and m.user_id = auth.uid()
    )
  );

create policy "Users can insert workspaces in their org" on workspaces
  for insert with check (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      where m.organization_id = workspaces.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Membership RLS policies
create policy "Users can read own memberships" on membership
  for select using (auth.uid() = user_id);

create policy "Users can insert memberships" on membership
  for insert with check (
    auth.uid() is not null and
    exists (
      select 1 from organizations o
      where o.id = organization_id
      and (o.owner_id = auth.uid() or exists (
        select 1 from membership m
        where m.organization_id = o.id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
      ))
    )
  );

create policy "Users can update own role" on membership
  for update using (
    auth.uid() = user_id or
    exists (
      select 1 from organizations o
      where o.id = membership.organization_id
      and o.owner_id = auth.uid()
    ) or
    exists (
      select 1 from membership m
      where m.organization_id = membership.organization_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
    )
  );

-- Channels RLS policies
create policy "Users can read channels in their workspace" on channels
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      join workspaces w on w.id = channels.workspace_id
      where m.organization_id = w.organization_id
      and m.user_id = auth.uid()
    )
  );

create policy "Users can insert channels" on channels
  for insert with check (
    auth.uid() is not null and
    exists (
      select 1 from membership m
      join workspaces w on w.id = channels.workspace_id
      where m.organization_id = w.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Messages RLS policies
create policy "Users can read messages in channels they can read" on messages
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from channel_members cm
      join channels c on c.id = cm.channel_id
      join workspaces w on w.id = c.workspace_id
      join membership m on m.organization_id = w.organization_id
      where cm.user_id = auth.uid()
      and c.id = messages.channel_id
    )
    or type = 'system'
  );

create policy "Users can insert messages" on messages
  for insert with check (
    auth.uid() is not null and
    exists (
      select 1 from channel_members cm
      join channels c on c.id = cm.channel_id
      join workspaces w on w.id = c.workspace_id
      join membership m on m.organization_id = w.organization_id
      where cm.user_id = auth.uid()
      and c.id = messages.channel_id
      and messages.is_deleted = false
    )
  );

-- Reactions RLS policies
create policy "Users can read reactions in readable channels" on reactions
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from channel_members cm
      join channels c on c.id = cm.channel_id
      join workspaces w on w.id = c.workspace_id
      join membership m on m.organization_id = w.organization_id
      where cm.user_id = auth.uid()
      and c.id = reactions.message_id
    )
  );

create policy "Users can insert reactions" on reactions
  for insert with check (
    auth.uid() is not null and
    exists (
      select 1 from channel_members cm
      join channels c on c.id = cm.channel_id
      join workspaces w on w.id = c.workspace_id
      join membership m on m.organization_id = w.organization_id
      where cm.user_id = auth.uid()
      and c.id = (select channel_id from messages where id = reactions.message_id)
    )
  );

-- Notifications RLS policies
create policy "Users can read own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- Comments for RLS triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_users_updated_at before update on users for each row execute function public.handle_updated_at();
create trigger handle_organizations_updated_at before update on organizations for each row execute function public.handle_updated_at();
create trigger handle_workspaces_updated_at before update on workspaces for each row execute function public.handle_updated_at();
create trigger handle_membership_updated_at before update on membership for each row execute function public.handle_updated_at();
create trigger handle_channels_updated_at before update on channels for each row execute function public.handle_updated_at();
create trigger handle_messages_updated_at before update on messages for each row execute function public.handle_updated_at();
create trigger handle_integrations_updated_at before update on integrations for each row execute function public.handle_updated_at();