-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text CHECK (char_length(content) > 0),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  parent_id uuid,
  is_approved boolean NOT NULL DEFAULT false,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id)
);
CREATE TABLE public.likes (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT likes_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  user1_liked boolean DEFAULT false,
  user2_liked boolean DEFAULT false,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'exited'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_revealed boolean NOT NULL DEFAULT false,
  type text DEFAULT 'match'::text CHECK (type = ANY (ARRAY['match'::text, 'direct'::text])),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id),
  CONSTRAINT matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.matching_queue (
  user_id uuid NOT NULL,
  target_gender text,
  target_region text,
  target_zodiac text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matching_queue_pkey PRIMARY KEY (user_id),
  CONSTRAINT matching_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text,
  image_url text,
  type text DEFAULT 'text'::text CHECK (type = ANY (ARRAY['text'::text, 'image'::text, 'emoji'::text])),
  reactions jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  sender_id uuid,
  type text NOT NULL CHECK (type = ANY (ARRAY['like'::text, 'comment'::text, 'match'::text, 'system'::text])),
  reference_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  link text NOT NULL,
  content text NOT NULL DEFAULT '''Ai đó đã thích bài viết của bạn''::text'::text,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  content text CHECK (char_length(content) > 0),
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text DEFAULT 'Anonymous User'::text,
  avatar_url text,
  birth_date date,
  location text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  zodiac text NOT NULL DEFAULT 'all'::text,
  gender USER-DEFINED,
  role USER-DEFINED NOT NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid,
  target_id uuid,
  reason text NOT NULL,
  evidence_image_url text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'resolved'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  target_type text NOT NULL DEFAULT '''post''::text'::text,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id),
  CONSTRAINT reports_post_id_fkey FOREIGN KEY (target_id) REFERENCES public.posts(id)
);