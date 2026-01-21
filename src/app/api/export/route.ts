import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { productType } = await request.json()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('productType', productType)
      .order('createdAt', { ascending: false })
    
    if (error) throw error

    // Crear datos para Excel
    const worksheetData = [
      ['Tipo/Marca', 'Medida', 'Precio Lista (Bs)', 'Precio Lista ($)', 'Ajuste Caucha (%)', 'Ajuste Transferencia (%)', 'Ajuste Divisas (%)', 'Ajuste Personalizado (%)'],
      ...products.map(product => [
        product.type,
        product.medida,
        product.precioListaBs,
        product.precioListaUsd,
        product.adjustmentCashea || '',
        product.adjustmentTransferencia || '',
        product.adjustmentDivisas || '',
        product.adjustmentCustom || ''
      ])
    ]

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // Crear workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, productType === 'cauchos' ? 'Cauchos' : productType === 'baterias' ? 'Baterías' : 'Productos')

    // Generar buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Retornar archivo
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${productType}_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json({ error: 'Failed to export to Excel' }, { status: 500 })
  }
}