import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Users, FileText, DollarSign, Settings, Shield, Trash2, Check, X, Plus } from 'lucide-react'

export default function AdminPanel() {
  const { user, profile } = useAuth()
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [verificationRequests, setVerificationRequests] = useState([])
  const [ads, setAds] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [newAd, setNewAd] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    is_active: true
  })

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadAdminData()
    }
  }, [profile])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Cargar usuarios
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Cargar posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      
      // Cargar solicitudes de verificación
      const { data: verificationsData } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false })
      
      // Cargar anuncios
      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Calcular estadísticas
      const totalUsers = usersData?.length || 0
      const totalPosts = postsData?.length || 0
      const pendingVerifications = verificationsData?.filter(v => v.status === 'pending').length || 0
      const activeAds = adsData?.filter(ad => ad.is_active).length || 0

      setUsers(usersData || [])
      setPosts(postsData || [])
      setVerificationRequests(verificationsData || [])
      setAds(adsData || [])
      setStats({
        totalUsers,
        totalPosts,
        pendingVerifications,
        activeAds
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      
      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleUserVerification = async (userId, isVerified) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !isVerified })
        .eq('id', userId)
      
      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_verified: !isVerified } : user
      ))
    } catch (error) {
      console.error('Error updating verification:', error)
    }
  }

  const deletePost = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
      
      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== postId))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleVerificationRequest = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
      
      if (error) throw error
      
      if (status === 'approved') {
        const request = verificationRequests.find(r => r.id === requestId)
        if (request) {
          await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', request.user_id)
        }
      }
      
      setVerificationRequests(verificationRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      ))
    } catch (error) {
      console.error('Error handling verification request:', error)
    }
  }

  const createAd = async () => {
    try {
      const { error } = await supabase
        .from('ads')
        .insert([newAd])
      
      if (error) throw error
      
      setNewAd({
        title: '',
        content: '',
        image_url: '',
        link_url: '',
        is_active: true
      })
      
      loadAdminData()
    } catch (error) {
      console.error('Error creating ad:', error)
    }
  }

  const toggleAdStatus = async (adId, isActive) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !isActive })
        .eq('id', adId)
      
      if (error) throw error
      
      setAds(ads.map(ad => 
        ad.id === adId ? { ...ad, is_active: !isActive } : ad
      ))
    } catch (error) {
      console.error('Error updating ad status:', error)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
          <p className="text-gray-500">No tienes permisos de administrador.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona usuarios, contenido y configuraciones del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificaciones Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anuncios Activos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAds}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="verifications">Verificaciones</TabsTrigger>
          <TabsTrigger value="ads">Anuncios</TabsTrigger>
        </TabsList>

        {/* Gestión de Usuarios */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra roles y verificaciones de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user.username}</span>
                          {user.is_verified && (
                            <Badge variant="secondary" className="text-xs">Verificado</Badge>
                          )}
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{user.bio || 'Sin biografía'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserVerification(user.id, user.is_verified)}
                      >
                        {user.is_verified ? 'Quitar Verificación' : 'Verificar'}
                      </Button>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="px-3 py-1 border rounded text-sm"
                      >
                        <option value="normal">Normal</option>
                        <option value="verified">Verificado</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestión de Posts */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Posts</CardTitle>
              <CardDescription>Modera y elimina contenido inapropiado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium">{post.profiles?.username}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{post.content}</p>
                      {post.image_url && (
                        <img 
                          src={post.image_url} 
                          alt="Post" 
                          className="w-32 h-32 object-cover rounded"
                        />
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El post será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePost(post.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verificaciones */}
        <TabsContent value="verifications">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Verificación</CardTitle>
              <CardDescription>Revisa y aprueba solicitudes de verificación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {request.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <span className="font-medium">{request.profiles?.username}</span>
                        <p className="text-sm text-gray-500">
                          Solicitado: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        <Badge variant={
                          request.status === 'pending' ? 'default' :
                          request.status === 'approved' ? 'secondary' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerificationRequest(request.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleVerificationRequest(request.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anuncios */}
        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Anuncios</CardTitle>
              <CardDescription>Crea y gestiona anuncios publicitarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Crear nuevo anuncio */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-4">Crear Nuevo Anuncio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={newAd.title}
                        onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                        placeholder="Título del anuncio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link">URL de destino</Label>
                      <Input
                        id="link"
                        value={newAd.link_url}
                        onChange={(e) => setNewAd({...newAd, link_url: e.target.value})}
                        placeholder="https://ejemplo.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="content">Contenido</Label>
                      <Textarea
                        id="content"
                        value={newAd.content}
                        onChange={(e) => setNewAd({...newAd, content: e.target.value})}
                        placeholder="Descripción del anuncio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">URL de imagen</Label>
                      <Input
                        id="image"
                        value={newAd.image_url}
                        onChange={(e) => setNewAd({...newAd, image_url: e.target.value})}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newAd.is_active}
                        onCheckedChange={(checked) => setNewAd({...newAd, is_active: checked})}
                      />
                      <Label>Activo</Label>
                    </div>
                  </div>
                  <Button onClick={createAd} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Anuncio
                  </Button>
                </div>

                {/* Lista de anuncios */}
                <div className="space-y-4">
                  {ads.map((ad) => (
                    <div key={ad.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{ad.title}</h4>
                          <Badge variant={ad.is_active ? 'secondary' : 'outline'}>
                            {ad.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{ad.content}</p>
                        {ad.link_url && (
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                            {ad.link_url}
                          </a>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                      >
                        {ad.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

