export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const data = await request.json()
    
    const settingData = {
      settingKey: key,
      settingValue: data.settingValue,
      taxRate: data.taxRate,
      globalCashea: data.globalCashea,
      globalTransferencia: data.globalTransferencia,
      globalDivisas: data.globalDivisas,
      globalCustom: data.globalCustom,
    }
    
    const setting = await db.upsertSetting(settingData)
    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}