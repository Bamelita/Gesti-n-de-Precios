import { NextRequest, NextResponse } from 'next/server'

// Notify realtime service of changes
async function notifyRealtimeUpdate(type: string, data: any) {
  try {
    await fetch('http://localhost:3001/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    })
  } catch (error) {
    console.log('Could not notify realtime service:', error.message)
  }
}

export { notifyRealtimeUpdate }