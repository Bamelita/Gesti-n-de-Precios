import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://spyodxdqweqcxhcauqyq.supabase.co'
const supabaseKey = 'sb_publishable_XEp4zZ6afjpX0Edw356Mtw_q5i17QLE'
const supabase = createClient(supabaseUrl, supabaseKey)

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

const PORT = 3001

// Store connected clients
const connectedClients = new Set()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  connectedClients.add(socket.id)

  // Send current data when client connects
  socket.on('request-current-data', async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*').order('createdAt', { ascending: false }),
        supabase.from('settings').select('*').order('settingKey', { ascending: true })
      ])

      socket.emit('data-update', {
        products: productsRes.data || [],
        settings: settingsRes.data || []
      })
    } catch (error) {
      console.error('Error sending current data:', error)
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    connectedClients.delete(socket.id)
  })
})

// Function to broadcast updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  console.log(`Broadcasting ${type} update to ${connectedClients.size} clients`)
  io.emit('data-update', { type, [type]: data })
}

// HTTP endpoint for receiving notifications from API routes
httpServer.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/notify') {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        const { type, data } = JSON.parse(body)
        broadcastUpdate(type, data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true }))
      } catch (error) {
        console.error('Error processing notification:', error)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid request' }))
      }
    })
  } else {
    res.writeHead(404)
    res.end()
  }
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`)
})

// Export for potential external use
export { io, connectedClients }