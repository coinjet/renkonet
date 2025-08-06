import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Image, Video, Smile, Send } from 'lucide-react'
import LoadingSpinner from '../ui/LoadingSpinner'

const CreatePost = ({ onPostCreated }) => {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('El contenido no puede estar vacío')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            likes_count: 0,
            comments_count: 0
          }
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            is_verified,
            role
          )
        `)
        .single()

      if (error) throw error

      // Clear form
      setContent('')
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated(data)
      }

    } catch (err) {
      console.error('Error creating post:', err)
      setError('Error al crear la publicación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {profile?.username || 'Usuario'}
            </p>
            <p className="text-sm text-gray-500">
              ¿Qué estás pensando?
            </p>
          </div>
        </div>

        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte algo interesante..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length}/500
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              disabled
            >
              <Image className="w-5 h-5" />
              <span className="text-sm">Foto</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              disabled
            >
              <Video className="w-5 h-5" />
              <span className="text-sm">Video</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              disabled
            >
              <Smile className="w-5 h-5" />
              <span className="text-sm">Emoji</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publicar</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost

