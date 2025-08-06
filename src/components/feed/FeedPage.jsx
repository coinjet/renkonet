import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'
import CreatePost from '../post/CreatePost'
import PostCard from '../post/PostCard'
import StoriesBar from '../stories/StoriesBar'
import { RefreshCw } from 'lucide-react'

const FeedPage = () => {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Fetch posts from database
  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const { data, error } = await supabase
        .from('posts')
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
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Error al cargar las publicaciones')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  // Handle post update (likes, comments)
  const handlePostUpdate = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    )
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchPosts(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Stories Bar */}
      <StoriesBar />

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Tu Feed</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¡Bienvenido a tu feed!
            </h3>
            <p className="text-gray-600 mb-4">
              Sigue a otros usuarios para ver sus publicaciones aquí
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear tu primera publicación
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={handlePostUpdate}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {posts.length >= 20 && (
        <div className="text-center py-6">
          <button
            onClick={() => fetchPosts()}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cargar más publicaciones
          </button>
        </div>
      )}
    </div>
  )
}

export default FeedPage

