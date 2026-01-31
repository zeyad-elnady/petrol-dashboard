-- Drop the existing foreign key to auth.users if it exists (or just generic drop)
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- We might need to find the auto-generated name if we didn't name it.
-- But since we are likely re-running or fixing, let's just ensure the correct one exists.
-- If the previous one was REFERENCES auth.users, it might have a random name.
-- But we can try to add the new one.

-- First, let's try to identify if we can just ADD the new constraint.
-- Ideally we want `user_id` to reference `public.users(id)`.

ALTER TABLE public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(id)
    ON DELETE CASCADE;
