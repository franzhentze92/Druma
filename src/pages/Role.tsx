import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User as UserIcon, Heart } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const Role: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('client')

  const choose = (role: 'client' | 'provider' | 'shelter') => {
    console.log('Role selected:', role)
    localStorage.setItem('user_role', role)
    console.log('Role saved to localStorage:', localStorage.getItem('user_role'))
    
    switch (role) {
      case 'client':
        console.log('Navigating to client dashboard...')
        navigate('/client-dashboard')
        break
      case 'provider':
        console.log('Navigating to provider dashboard...')
        navigate('/provider')
        break
      case 'shelter':
        console.log('Navigating to shelter dashboard...')
        navigate('/shelter-dashboard')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-6">
            <h1 className="text-4xl font-bold mb-3">🐾 Bienvenido a Gruma</h1>
            <h2 className="text-2xl font-semibold mb-2">Selecciona tu tipo de cuenta</h2>
            <p className="text-purple-100 text-lg">Elige cómo deseas usar Gruma</p>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white p-1 shadow-lg rounded-xl">
            <TabsTrigger 
              value="client" 
              className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm rounded-lg"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Cliente
            </TabsTrigger>
            <TabsTrigger 
              value="provider" 
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Proveedor
            </TabsTrigger>
            <TabsTrigger 
              value="shelter" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-lg"
            >
              <Heart className="w-4 h-4 mr-2" />
              Albergue
            </TabsTrigger>
          </TabsList>

          {/* Client Tab */}
          <TabsContent value="client" className="space-y-6">
            <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl text-purple-700">Cliente</CardTitle>
                <p className="text-gray-600">Explora y adopta mascotas</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Explora el catálogo de mascotas, guarda favoritos y solicita adopciones
                </p>
                <Button 
                  onClick={() => choose('client')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
                >
                  Continuar como Cliente
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Provider Tab */}
          <TabsContent value="provider" className="space-y-6">
            <Card className="border-2 border-emerald-200 hover:border-emerald-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl text-emerald-700">Proveedor</CardTitle>
                <p className="text-gray-600">Gestiona servicios y productos</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Ofrece servicios veterinarios, vende productos y gestiona citas
                </p>
                <Button 
                  onClick={() => choose('provider')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
                >
                  Continuar como Proveedor
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shelter Tab */}
          <TabsContent value="shelter" className="space-y-6">
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10" />
                </div>
                <CardTitle className="text-2xl text-blue-700">Albergue</CardTitle>
                <p className="text-gray-600">Rescata y encuentra hogares</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Publica mascotas en adopción y gestiona solicitudes
                </p>
                <Button 
                  onClick={() => choose('shelter')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 text-lg font-semibold"
                >
                  Continuar como Albergue
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Role
