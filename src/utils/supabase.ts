import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctdjnrxbqpnulzyihtoh.supabase.co';
const supabaseKey = 'sb_publishable_iVW9lKdkXWrIwnMtbUmzig_Hncxv9Iw';

export const supabase = createClient(supabaseUrl, supabaseKey);