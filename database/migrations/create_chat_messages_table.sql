-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow everyone to view messages (authenticated users)
CREATE POLICY "Allow authenticated users to view all chat messages"
    ON public.chat_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy to allow authenticated users to insert their own messages
CREATE POLICY "Allow authenticated users to insert their own chat messages"
    ON public.chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create a view or join helper if needed, but for now we'll just use the foreign key in the query
-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
