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

// Store connected users with their info
interface ConnectedUser {
  id: string
  socketId: string
  userType: 'admin' | 'client' | 'worker'
  connectedAt: Date
  lastActivity: Date
}

const connectedUsers = new Map<string, ConnectedUser>()

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // When user identifies themselves
  socket.on('identify-user', (userData: { userType: 'admin' | 'client' | 'worker' }) => {
    const user: ConnectedUser = {
      id: socket.id,
      socketId: socket.id,
      userType: userData.userType,
      connectedAt: new Date(),
      lastActivity: new Date()
    }
    
    connectedUsers.set(socket.id, user)
    console.log(`User identified: ${userData.userType} - ${socket.id}`)
    
    // Send updated user list to all admins
    broadcastUserList()
  })

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

  // Request user list (admin only)
  socket.on('request-user-list', () => {
    const user = connectedUsers.get(socket.id)
    if (user && user.userType === 'admin') {
      socket.emit('user-list', Array.from(connectedUsers.values()))
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
    connectedUsers.delete(socket.id)
    broadcastUserList()
  })

  // Update last activity
  socket.on('activity', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      user.lastActivity = new Date()
    }
  })
})

// Function to broadcast user list to admins
function broadcastUserList() {
  const admins = Array.from(connectedUsers.values()).filter(user => user.userType === 'admin')
  const userList = Array.from(connectedUsers.values())
  
  admins.forEach(admin => {
    const socket = io.sockets.sockets.get(admin.socketId)
    if (socket) {
      socket.emit('user-list', userList)
    }
  })
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(type: string, data: any) {
  console.log(`Broadcasting ${type} update to ${connectedUsers.size} clients`)
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
export { io, connectedUsers }