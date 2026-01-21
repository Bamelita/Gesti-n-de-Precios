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

interface RealtimeData {
  products: Product[]
  settings: Setting[]
}

export function useRealtimeData() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [data, setData] = useState<RealtimeData>({ products: [], settings: [] })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to realtime service')
      setIsConnected(true)
      // Request current data when connected
      newSocket.emit('request-current-data')
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

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const updateData = useCallback((type: 'products' | 'settings', newData: any) => {
    setData(prevData => ({
      ...prevData,
      [type]: newData
    }))
  }, [])

  return {
    socket,
    data,
    isConnected,
    updateData
  }
}