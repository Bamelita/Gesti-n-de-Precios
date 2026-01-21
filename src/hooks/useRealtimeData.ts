'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Product {
  id: string
  productType: string
  type: string
  medida: string
  precioListaBs: number
  precioListaUsd: number
  adjustmentCashea?: number
  adjustmentTransferencia?: number
  adjustmentDivisas?: number
  adjustmentCustom?: number
  createdAt: string
  updatedAt: string
}

interface Setting {
  id: string
  settingKey: string
  settingValue?: string
  taxRate?: number
  globalCashea?: number
  globalTransferencia?: number
  globalDivisas?: number
  globalCustom?: number
  createdAt: string
  updatedAt: string
}

interface ConnectedUser {
  id: string
  socketId: string
  userType: 'admin' | 'client' | 'worker'
  name?: string
  lastName?: string
  connectedAt: string
  lastActivity: string
}

interface RealtimeData {
  products: Product[]
  settings: Setting[]
}

export function useRealtimeData(userType: 'admin' | 'client' | 'worker' = 'client') {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [data, setData] = useState<RealtimeData>({ products: [], settings: [] })
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to realtime service')
      setIsConnected(true)
      
      // Identify user
      newSocket.emit('identify-user', { userType })
      
      // Request current data when connected
      newSocket.emit('request-current-data')
      
      // Request user list if admin
      if (userType === 'admin') {
        newSocket.emit('request-user-list')
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from realtime service')
      setIsConnected(false)
    })

    newSocket.on('data-update', (newData: RealtimeData) => {
      console.log('Received real-time update:', newData)
      setData(prevData => ({
        ...prevData,
        ...newData
      }))
    })

    // Listen for user list updates (admin only)
    if (userType === 'admin') {
      newSocket.on('user-list', (users: ConnectedUser[]) => {
        console.log('Received user list:', users)
        setConnectedUsers(users)
      })
    }

    // Send activity updates
    const activityInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('activity')
      }
    }, 30000) // Every 30 seconds

    newSocket.on('admin-privileges-removed', (message: string) => {
      alert(message)
      window.location.reload() // Force reload to reset application state
    })

    setSocket(newSocket)

    return () => {
      clearInterval(activityInterval)
      newSocket.close()
    }
  }, [userType])

  const updateData = useCallback((type: 'products' | 'settings', newData: any) => {
    setData(prevData => ({
      ...prevData,
      [type]: newData
    }))
  }, [])

  return {
    socket,
    data,
    connectedUsers,
    isConnected,
    updateData
  }
}