-- Create app_releases table
CREATE TABLE IF NOT EXISTS public.app_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_code INTEGER NOT NULL UNIQUE,
    version_name TEXT NOT NULL,
    release_notes TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT FALSE,
    download_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    downloads_count INTEGER DEFAULT 0
);

-- Create admin_otps table
CREATE TABLE IF NOT EXISTS public.admin_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_releases
-- Allow public select access (read-only for app updates)
CREATE POLICY "Allow public read access to app_releases" ON public.app_releases
    FOR SELECT TO public USING (true);

-- Note: No policies are created for admin_otps, which restricts all operations to service-role (backend only).

-- Create apks storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('apks', 'apks', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to apks bucket objects
CREATE POLICY "Allow public read access to apks" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'apks');
