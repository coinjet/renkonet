import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'
import PostCard from '../post/PostCard'
import { Search, TrendingUp, Users, Hash } from 'lucide-react'

const ExplorePage = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch trending posts
  const fetchTrendingPosts = async () => {
    try {
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
        .order('likes_count', { ascending: false })
        .limit(10)

      if (error) throw error
      setTrendingPosts(data || [])
    } catch (err) {
      console.error('Error fetching trending posts:', err)
    }
  }

  // Fetch suggested users
  const fetchSuggestedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .order('followers_count', { ascending: false })
        .limit(5)

      if (error) throw error
      setSuggestedUsers(data || [])
    } catch (err) {
      console.error('Error fetching suggested users:', err)
    }
  }

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      // Search posts
      const { data: posts, error: postsError } = await supabase
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
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (postsError) throw postsError

      // Search users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(5)

      if (usersError) throw usersError

      setSearchResults({
        posts: posts || [],
        users: users || []
      })
    } catch (err) {
      console.error('Error searching:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchTrendingPosts(),
        fetchSuggestedUsers()
      ])
      setLoading(false)
    }

    loadData()
  }, [user])

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar publicaciones, usuarios..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && searchResults && (
        <div className="space-y-6">
          {/* Users Results */}
          {searchResults.users?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Usuarios
              </h3>
              <div className="space-y-3">
                {searchResults.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        {user.full_name && (
                          <p className="text-sm text-gray-600">{user.full_name}</p>
                        )}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700">
                      Seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Results */}
          {searchResults.posts?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Publicaciones
              </h3>
              {searchResults.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* No Results */}
          {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}

      {/* Default Content (when not searching) */}
      {!searchQuery && (
        <div className="space-y-6">
          {/* Suggested Users */}
          {suggestedUsers.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Usuarios sugeridos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        {user.full_name && (
                          <p className="text-sm text-gray-600">{user.full_name}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {user.followers_count || 0} seguidores
                        </p>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Seguir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Posts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Publicaciones populares
            </h3>
            {trendingPosts.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay publicaciones populares
                </h3>
                <p className="text-gray-600">
                  Las publicaciones con más interacciones aparecerán aquí
                </p>
              </div>
            ) : (
              trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExplorePage

