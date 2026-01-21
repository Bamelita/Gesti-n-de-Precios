export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update or create each global adjustment setting
    const listTypes = ['cauchos', 'baterias']
    
    for (const listType of listTypes) {
      const settingKey = `global_adj_${listType}`
      
      const settingData = {
        settingKey,
        settingValue: JSON.stringify(data),
        globalCashea: data.cashea || 0,
        globalTransferencia: data.transferencia || 0,
        globalDivisas: data.divisas || 0,
        globalCustom: data.custom || 0,
      }
      
      const { error } = await supabase
        .from('settings')
        .upsert(settingData, { onConflict: 'settingKey' })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating global adjustments:', error)
    return NextResponse.json({ error: 'Failed to update global adjustments' }, { status: 500 })
  }
}