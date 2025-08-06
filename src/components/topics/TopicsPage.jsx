import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Users, Plus, Search, TrendingUp, Hash, UserPlus, UserMinus } from 'lucide-react'

export default function TopicsPage() {
  const { user, profile } = useAuth()
  const [topics, setTopics] = useState([])
  const [myTopics, setMyTopics] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTopic, setNewTopic] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadTopics()
    if (user) {
      loadMyTopics()
    }
  }, [user])

  const loadTopics = async () => {
    try {
      setLoading(true)
      
      // Cargar todos los temas
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          *,
          profiles:creator_id (username, avatar_url),
          topic_members (count)
        `)
        .order('members_count', { ascending: false })

      if (topicsError) throw topicsError

      // Calcular miembros reales
      const topicsWithMembers = await Promise.all(
        (topicsData || []).map(async (topic) => {
          const { count } = await supabase
            .from('topic_members')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id)
          
          return { ...topic, members_count: count || 0 }
        })
      )

      setTopics(topicsWithMembers)
      
      // Temas trending (más miembros en los últimos 7 días)
      const { data: trendingData } = await supabase
        .from('topics')
        .select(`
          *,
          profiles:creator_id (username, avatar_url)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('members_count', { ascending: false })
        .limit(5)

      setTrendingTopics(trendingData || [])
    } catch (error) {
      console.error('Error loading topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMyTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topic_members')
        .select(`
          topics (
            *,
            profiles:creator_id (username, avatar_url)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      setMyTopics(data?.map(item => item.topics) || [])
    } catch (error) {
      console.error('Error loading my topics:', error)
    }
  }

  const createTopic = async () => {
    if (!newTopic.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          name: newTopic.name,
          description: newTopic.description,
          creator_id: user.id,
          members_count: 1
        }])
        .select()
        .single()

      if (error) throw error

      // Unirse automáticamente al tema creado
      await supabase
        .from('topic_members')
        .insert([{
          topic_id: data.id,
          user_id: user.id
        }])

      setNewTopic({ name: '', description: '' })
      setShowCreateDialog(false)
      loadTopics()
      loadMyTopics()
    } catch (error) {
      console.error('Error creating topic:', error)
    }
  }

  const joinTopic = async (topicId) => {
    try {
      const { error } = await supabase
        .from('topic_members')
        .insert([{
          topic_id: topicId,
          user_id: user.id
        }])

      if (error) throw error

      // Actualizar contador
      await supabase.rpc('increment_topic_members', { topic_id: topicId })

      loadTopics()
      loadMyTopics()
    } catch (error) {
      console.error('Error joining topic:', error)
    }
  }

  const leaveTopic = async (topicId) => {
    try {
      const { error } = await supabase
        .from('topic_members')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', user.id)

      if (error) throw error

      // Actualizar contador
      await supabase.rpc('decrement_topic_members', { topic_id: topicId })

      loadTopics()
      loadMyTopics()
    } catch (error) {
      console.error('Error leaving topic:', error)
    }
  }

  const isUserMember = (topicId) => {
    return myTopics.some(topic => topic.id === topicId)
  }

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Temas y Comunidades</h1>
          <p className="text-gray-600">Únete a comunidades de tu interés y conecta con personas afines</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Tema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tema</DialogTitle>
              <DialogDescription>
                Crea una nueva comunidad para conectar con personas que comparten tus intereses
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Tema</Label>
                <Input
                  id="name"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                  placeholder="Ej: Fotografía, Tecnología, Arte..."
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTopic.description}
                  onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                  placeholder="Describe de qué trata este tema..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={createTopic}>
                Crear Tema
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar temas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos los Temas</TabsTrigger>
          <TabsTrigger value="my">Mis Temas</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {/* Todos los temas */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {topic.members_count} miembros
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {topic.description || 'Sin descripción'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                        {topic.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span>Por {topic.profiles?.username}</span>
                    </div>
                    
                    {user && (
                      <Button
                        variant={isUserMember(topic.id) ? "outline" : "default"}
                        size="sm"
                        onClick={() => isUserMember(topic.id) ? leaveTopic(topic.id) : joinTopic(topic.id)}
                      >
                        {isUserMember(topic.id) ? (
                          <>
                            <UserMinus className="h-4 w-4 mr-1" />
                            Salir
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Unirse
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTopics.length === 0 && (
            <div className="text-center py-12">
              <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron temas</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda o crea un nuevo tema.</p>
            </div>
          )}
        </TabsContent>

        {/* Mis temas */}
        <TabsContent value="my">
          {myTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTopics.map((topic) => (
                <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {topic.members_count} miembros
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {topic.description || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {topic.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span>Por {topic.profiles?.username}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveTopic(topic.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Salir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No te has unido a ningún tema</h3>
              <p className="text-gray-500 mb-4">Explora temas interesantes y únete a comunidades afines.</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer tema
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Trending */}
        <TabsContent value="trending">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Temas en Tendencia</h2>
            </div>
            
            {trendingTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTopics.map((topic, index) => (
                  <Card key={topic.id} className="hover:shadow-lg transition-shadow relative">
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between pr-8">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-5 w-5 text-orange-600" />
                          <CardTitle className="text-lg">{topic.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          {topic.members_count} miembros
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {topic.description || 'Sin descripción'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                            {topic.profiles?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>Por {topic.profiles?.username}</span>
                        </div>
                        
                        {user && (
                          <Button
                            variant={isUserMember(topic.id) ? "outline" : "default"}
                            size="sm"
                            onClick={() => isUserMember(topic.id) ? leaveTopic(topic.id) : joinTopic(topic.id)}
                          >
                            {isUserMember(topic.id) ? (
                              <>
                                <UserMinus className="h-4 w-4 mr-1" />
                                Salir
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Unirse
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay temas trending</h3>
                <p className="text-gray-500">Los temas más populares aparecerán aquí.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

