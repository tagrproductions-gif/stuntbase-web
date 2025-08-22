import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'
import { Database } from '../../../shared/types/database'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
