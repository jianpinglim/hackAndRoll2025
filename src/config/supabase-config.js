import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema definition
const TABLES = {
    ROOMS: 'rooms',
    GAME_STATES: 'game_states',
    CHAMPIONS: 'champions'
}

// Channel names for realtime subscriptions
const CHANNELS = {
    ROOM: 'room',
    GAME: 'game'
}

export {
    supabase,
    TABLES,
    CHANNELS
}