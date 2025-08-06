import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Plus, Play } from 'lucide-react'

const StoriesBar = () => {
  const { user, profile } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch active stories
  const fetchStories = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group stories by user
      const groupedStories = {}
      data?.forEach(story => {
        const userId = story.user_id
        if (!groupedStories[userId]) {
          groupedStories[userId] = {
            user: story.profiles,
            stories: []
          }
        }
        groupedStories[userId].stories.push(story)
      })

      setStories(Object.values(groupedStories))
    } catch (err) {
      console.error('Error fetching stories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  // Handle create story
  const handleCreateStory = () => {
    // TODO: Implement story creation modal
    console.log('Create story clicked')
  }

  // Handle view story
  const handleViewStory = (userStories) => {
    // TODO: Implement story viewer modal
    console.log('View story clicked', userStories)
  }

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-12 h-3 bg-gray-200 rounded mt-2 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex space-x-4 overflow-x-auto">
        {/* Add Story Button */}
        <div className="flex-shrink-0 text-center">
          <button
            onClick={handleCreateStory}
            className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
          <p className="text-xs text-gray-600 mt-2 truncate w-16">
            Agregar
          </p>
        </div>

        {/* Stories */}
        {stories.length === 0 ? (
          <div className="flex-1 text-center py-4">
            <p className="text-gray-500 text-sm">
              No hay historias para mostrar
            </p>
          </div>
        ) : (
          stories.map((userStory, index) => (
            <div key={index} className="flex-shrink-0 text-center">
              <button
                onClick={() => handleViewStory(userStory)}
                className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gradient-to-r from-pink-500 to-yellow-500 p-0.5 hover:scale-105 transition-transform"
              >
                <div className="w-full h-full bg-white rounded-full p-0.5">
                  {userStory.user?.avatar_url ? (
                    <img
                      src={userStory.user.avatar_url}
                      alt={userStory.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {userStory.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-current" />
                </div>
              </button>
              <p className="text-xs text-gray-600 mt-2 truncate w-16">
                {userStory.user?.username || 'Usuario'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default StoriesBar

