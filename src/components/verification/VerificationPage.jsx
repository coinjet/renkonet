import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { CheckCircle, Clock, XCircle, Shield, CreditCard, Star } from 'lucide-react'

export default function VerificationPage() {
  const { user, profile } = useAuth()
  const [verificationRequest, setVerificationRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    reason: '',
    profession: '',
    website: '',
    social_media: '',
    plan: 'monthly'
  })

  const plans = {
    monthly: {
      price: 9.99,
      period: 'mes',
      description: 'Verificación mensual con renovación automática'
    },
    yearly: {
      price: 99.99,
      period: 'año',
      description: 'Verificación anual con 2 meses gratis'
    }
  }

  useEffect(() => {
    loadVerificationStatus()
  }, [user])

  const loadVerificationStatus = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setVerificationRequest(data[0])
      }
    } catch (error) {
      console.error('Error loading verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Simular procesamiento de pago
      const paymentInfo = {
        plan: formData.plan,
        amount: plans[formData.plan].price,
        currency: 'USD',
        payment_method: 'stripe',
        transaction_id: `tx_${Date.now()}`,
        status: 'completed'
      }

      const { error } = await supabase
        .from('verification_requests')
        .insert([{
          user_id: user.id,
          status: 'pending',
          payment_info: paymentInfo,
          reason: formData.reason,
          profession: formData.profession,
          website: formData.website,
          social_media: formData.social_media
        }])

      if (error) throw error

      // Recargar estado
      await loadVerificationStatus()
      
      // Limpiar formulario
      setFormData({
        reason: '',
        profession: '',
        website: '',
        social_media: '',
        plan: 'monthly'
      })
    } catch (error) {
      console.error('Error submitting verification request:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Si ya está verificado
  if (profile?.is_verified) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Cuenta Verificada!</CardTitle>
            <CardDescription>
              Tu cuenta ha sido verificada exitosamente. Ahora tienes acceso a todas las funciones premium.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-green-800">Badge de verificación visible en tu perfil</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">Prioridad en búsquedas y recomendaciones</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800">Acceso a funciones premium exclusivas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si tiene una solicitud pendiente
  if (verificationRequest) {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Solicitud en Revisión',
        description: 'Tu solicitud de verificación está siendo revisada por nuestro equipo. Te notificaremos cuando esté lista.'
      },
      approved: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Solicitud Aprobada',
        description: 'Tu solicitud ha sido aprobada. La verificación se activará en las próximas 24 horas.'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Solicitud Rechazada',
        description: 'Tu solicitud no cumplió con los criterios de verificación. Puedes enviar una nueva solicitud.'
      }
    }

    const config = statusConfig[verificationRequest.status]
    const StatusIcon = config.icon

    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <StatusIcon className={`h-8 w-8 ${config.color}`} />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Estado:</span>
                <Badge variant={
                  verificationRequest.status === 'pending' ? 'default' :
                  verificationRequest.status === 'approved' ? 'secondary' : 'destructive'
                }>
                  {verificationRequest.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Fecha de solicitud:</span>
                <span>{new Date(verificationRequest.created_at).toLocaleDateString()}</span>
              </div>
              {verificationRequest.payment_info && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Plan:</span>
                  <span>${verificationRequest.payment_info.amount} USD</span>
                </div>
              )}
            </div>
            
            {verificationRequest.status === 'rejected' && (
              <div className="mt-6">
                <Button 
                  onClick={() => setVerificationRequest(null)} 
                  className="w-full"
                >
                  Enviar Nueva Solicitud
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulario de solicitud de verificación
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificación de Cuenta</h1>
        <p className="text-gray-600">
          Obtén el badge de verificación y accede a funciones premium exclusivas
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Beneficios de la Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Badge de verificación azul en tu perfil</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Prioridad en búsquedas y recomendaciones</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Acceso a funciones premium</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Mayor credibilidad y confianza</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Soporte prioritario</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar Verificación</CardTitle>
          <CardDescription>
            Completa el formulario y selecciona tu plan de verificación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Planes de precios */}
            <div>
              <Label className="text-base font-medium">Selecciona tu plan</Label>
              <RadioGroup 
                value={formData.plan} 
                onValueChange={(value) => setFormData({...formData, plan: value})}
                className="mt-3"
              >
                {Object.entries(plans).map(([key, plan]) => (
                  <div key={key} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={key} id={key} />
                    <div className="flex-1">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        ${plan.price} USD / {plan.period}
                      </Label>
                      <p className="text-sm text-gray-500">{plan.description}</p>
                    </div>
                    {key === 'yearly' && (
                      <Badge variant="secondary">Ahorra 20%</Badge>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Información personal */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="profession">Profesión o Área de Trabajo</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  placeholder="Ej: Influencer, Artista, Empresario, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Razón para la Verificación</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Explica por qué necesitas la verificación..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="website">Sitio Web (Opcional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://tu-sitio-web.com"
                />
              </div>

              <div>
                <Label htmlFor="social_media">Redes Sociales (Opcional)</Label>
                <Input
                  id="social_media"
                  value={formData.social_media}
                  onChange={(e) => setFormData({...formData, social_media: e.target.value})}
                  placeholder="@usuario en Instagram, Twitter, etc."
                />
              </div>
            </div>

            {/* Resumen del pago */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Plan seleccionado:</span>
                <span className="capitalize">{formData.plan}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Precio:</span>
                <span className="text-lg font-bold">${plans[formData.plan].price} USD</span>
              </div>
              <div className="text-sm text-gray-600">
                {plans[formData.plan].description}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar y Solicitar Verificación
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Al enviar esta solicitud, aceptas nuestros términos de servicio y política de privacidad.
              El pago se procesará de forma segura a través de Stripe.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

