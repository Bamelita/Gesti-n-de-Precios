import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { notifyRealtimeUpdate } from '@/lib/realtime-notify'

export async function GET() {
  try {
    const products = await db.getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate ID if not provided
    if (!data.id) {
      data.id = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Ensure required fields
    if (!data.type || !data.medida) {
      return NextResponse.json({ error: 'Type and medida are required' }, { status: 400 })
    }
    
    const product = await db.createProduct(data)
    
    // Notify realtime clients
    const allProducts = await db.getProducts()
    notifyRealtimeUpdate('products', allProducts)
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}