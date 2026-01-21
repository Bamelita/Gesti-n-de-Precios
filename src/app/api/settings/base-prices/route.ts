import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update base price settings
    const settings = [
      { key: 'base_price_bs', value: data.basePriceBs?.toString() || '0' },
      { key: 'base_price_usd', value: data.basePriceUsd?.toString() || '0' }
    ]
    
    for (const setting of settings) {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          settingKey: setting.key, 
          settingValue: setting.value 
        }, { onConflict: 'settingKey' })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating base prices:', error)
    return NextResponse.json({ error: 'Failed to update base prices' }, { status: 500 })
  }
}