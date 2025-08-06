import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Heart, MessageCircle, Share, MoreHorizontal, Verified } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)

  // Handle like/unlike
  const handleLike = async () => {
    if (!user || loading) return

    setLoading(true)
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)

        if (error) throw error

        setLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([
            {
              user_id: user.id,
              post_id: post.id
            }
          ])

        if (error) throw error

        setLiked(true)
        setLikesCount(prev => prev + 1)
      }

      // Update post likes count in database
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes_count: liked ? likesCount - 1 : likesCount + 1 })
        .eq('id', post.id)

      if (updateError) throw updateError

    } catch (err) {
      console.error('Error handling like:', err)
      // Revert optimistic update
      setLiked(!liked)
      setLikesCount(post.likes_count || 0)
    } finally {
      setLoading(false)
    }
  }

  // Format time
  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: es 
      })
    } catch {
      return 'hace un momento'
    }
  }

  // Get verification badge
  const getVerificationBadge = (profile) => {
    if (profile?.role === 'admin') {
      return <Verified className="w-4 h-4 text-blue-600" />
    }
    if (profile?.role === 'verified' || profile?.is_verified) {
      return <Verified className="w-4 h-4 text-green-600" />
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-gray-900">
                  {post.profiles?.username || 'Usuario'}
                </h3>
                {getVerificationBadge(post.profiles)}
              </div>
              <p className="text-sm text-gray-500">
                {formatTime(post.created_at)}
              </p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-gray-900 whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image/Video (if exists) */}
      {post.image_url && (
        <div className="px-4 pb-4">
          <img
            src={post.image_url}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 transition-colors ${
                liked 
                  ? 'text-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section (placeholder) */}
      {post.comments_count > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Ver {post.comments_count} comentario{post.comments_count !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}

export default PostCard

