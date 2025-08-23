import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
// import { Database } from '../../../shared/types/database'
// Temporary: using any type until we fix the shared types
type Database = any

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
