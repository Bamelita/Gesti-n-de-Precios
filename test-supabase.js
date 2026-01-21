import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spyodxdqweqcxhcauqyq.supabase.co'
const supabaseKey = 'sb_publishable_XEp4zZ6afjpX0Edw356Mtw_q5i17QLE'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test if we can connect to the settings table
    const { data, error } = await supabase
      .from('settings')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message)
      
      if (error.message.includes('relation "settings" does not exist')) {
        console.log('📋 Tables do not exist. You need to run the SQL schema.')
      }
    } else {
      console.log('✅ Connection successful!')
      console.log('Data:', data)
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
  }
}

testConnection()