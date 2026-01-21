'use client'

import { useState } from 'react'
import { useRealtimeData, ConnectedUser } from '@/hooks/useRealtimeData'

interface AdminPanelProps {
  socket: any
  currentUser: any
}

export default function AdminPanel({ socket, currentUser }: AdminPanelProps) {
  const { connectedUsers } = useRealtimeData('admin')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMessage('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    setMessage('')

    socket.emit('change-admin-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    socket.on('password-change-success', (msg) => {
      setMessage(msg)
      setIsLoading(false)
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '' })
        setMessage('')
      }, 2000)
    })

    socket.on('password-change-error', (errorMsg) => {
      setMessage(errorMsg)
      setIsLoading(false)
    })
  }

  const handleRemoveAdmin = (targetSocketId: string, targetName: string) => {
    if (!canChangePassword) {
      alert('No tienes permiso para remover administradores. Solo los administradores principales pueden hacer esto.')
      return
    }

    if (!confirm(`¿Estás seguro de que quieres remover a ${targetName} como administrador?`)) {
      return
    }

    socket.emit('remove-admin', targetSocketId)

    socket.on('remove-admin-success', (msg) => {
      alert(msg)
    })

    socket.on('remove-admin-error', (errorMsg) => {
      alert(errorMsg)
    })
  }

  const admins = connectedUsers.filter(user => user.userType === 'admin')
  const canChangePassword = currentUser?.canChangePassword

  return (
    <div className="space-y-6">
      {/* Admin List */}
      <div>
        <h3 className="text-lg font-semibold text-amber-400 mb-3">Administradores Conectados</h3>
        <div className="space-y-2">
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-3 rounded bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div>
                  <div className="font-medium">
                    👑 {admin.name} {admin.lastName}
                    {admin.id === currentUser?.socketId && <span className="text-xs text-amber-400 ml-2">(Tú)</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    Conectado: {new Date(admin.connectedAt).toLocaleTimeString('es-VE')}
                  </div>
                </div>
              </div>
              
              {admin.id !== currentUser?.socketId && (
                <button
                  onClick={() => handleRemoveAdmin(admin.id, `${admin.name} ${admin.lastName}`)}
                  className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-all"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          
          {admins.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No hay administradores conectados
            </div>
          )}
        </div>
      </div>

      {/* Password Management */}
      <div>
        <h3 className="text-lg font-semibold text-amber-400 mb-3">Gestión de Contraseña</h3>
        {canChangePassword ? (
          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-primary px-4 py-2 rounded-lg font-medium text-gray-900"
            >
              Cambiar Contraseña de Admin
            </button>
            <p className="text-xs text-gray-400">
              Eres Administrador Principal y puedes cambiar la contraseña general.
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No tienes permisos de Administrador Principal</p>
            <p className="text-xs mt-1">Solo los primeros 2 administradores tienen estos permisos</p>
          </div>
        )}
      </div>

      {/* All Users */}
      <div>
        <h3 className="text-lg font-semibold text-amber-400 mb-3">Todos los Usuarios Conectados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {connectedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className={`w-2 h-2 rounded-full ${
                user.userType === 'admin' ? 'bg-red-400' :
                user.userType === 'worker' ? 'bg-blue-400' : 'bg-green-400'
              }`}></div>
              <div className="flex-1">
                <div className="text-xs font-medium">
                  {user.userType === 'admin' ? '👑 Admin' :
                   user.userType === 'worker' ? '👷 Trabajador' : '👤 Cliente'}
                  {user.name && `: ${user.name} ${user.lastName || ''}`}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(user.connectedAt).toLocaleTimeString('es-VE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-glass rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Cambiar Contraseña de Admin</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input-dark rounded-lg px-3 py-2 w-full text-white"
                  placeholder="Contraseña actual"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-dark rounded-lg px-3 py-2 w-full text-white"
                  placeholder="Nueva contraseña"
                />
              </div>

              {message && (
                <div className={`text-sm text-center p-2 rounded ${
                  message.includes('correctamente') 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex-1 btn-primary px-4 py-2 rounded-lg font-medium text-gray-900 disabled:opacity-50"
                >
                  {isLoading ? 'Cambiando...' : 'Cambiar'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordForm({ currentPassword: '', newPassword: '' })
                    setMessage('')
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}