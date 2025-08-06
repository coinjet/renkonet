import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'
import { 
  Settings, 
  Grid, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserMinus,
  Verified,
  Edit
} from 'lucide-react'

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth()
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || ''
  })

  // Fetch user's posts
  const fetchUserPosts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserPosts(data || [])
    } catch (err) {
      console.error('Error fetching user posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserPosts()
    }
  }, [user])

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    try {
      await updateProfile(editForm)
      setEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  // Get verification badge
  const getVerificationBadge = () => {
    if (profile?.role === 'admin') {
      return <Verified className="w-6 h-6 text-blue-600" />
    }
    if (profile?.role === 'verified' || profile?.is_verified) {
      return <Verified className="w-6 h-6 text-green-600" />
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="text-2xl font-bold border-b border-gray-300 focus:border-blue-500 outline-none"
                    placeholder="Nombre de usuario"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="text-lg border-b border-gray-300 focus:border-blue-500 outline-none w-full"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                    placeholder="Biografía"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.username || 'Usuario'}
                  </h1>
                  {getVerificationBadge()}
                </div>
                
                {profile?.full_name && (
                  <p className="text-lg text-gray-600 mb-2">
                    {profile.full_name}
                  </p>
                )}

                {profile?.bio && (
                  <p className="text-gray-700 mb-4">
                    {profile.bio}
                  </p>
                )}

                <div className="flex items-center justify-center md:justify-start space-x-6 mb-4">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">
                      {userPosts.length}
                    </span>
                    <span className="text-sm text-gray-600">Publicaciones</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">
                      {profile?.followers_count || 0}
                    </span>
                    <span className="text-sm text-gray-600">Seguidores</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">
                      {profile?.following_count || 0}
                    </span>
                    <span className="text-sm text-gray-600">Siguiendo</span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Perfil
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex justify-center">
            <button className="flex items-center space-x-2 px-6 py-4 border-b-2 border-blue-600 text-blue-600">
              <Grid className="w-4 h-4" />
              <span className="font-medium">Publicaciones</span>
            </button>
          </div>
        </div>

        {/* Posts Content */}
        <div className="p-6">
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay publicaciones aún
              </h3>
              <p className="text-gray-600">
                Cuando publiques fotos y videos, aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <p className="text-gray-900 text-sm line-clamp-3 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes_count || 0}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{post.comments_count || 0}</span>
                      </span>
                    </div>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

