import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { 
  Bell, 
  Clock, 
  Heart, 
  Star, 
  Calendar, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Utensils,
  Activity,
  Stethoscope,
  Play,
  Trash2,
  Edit,
  Zap,
  Smile
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface PetReminder {
  id: string;
  pet_id: string;
  reminder_type: 'feeding' | 'exercise' | 'vet' | 'play' | 'medication' | 'grooming';
  title: string;
  description: string;
  scheduled_time: string;
  scheduled_date: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  last_triggered?: string;
  next_trigger?: string;
  pet_voice_message: string;
  xp_reward: number;
  priority: 'low' | 'medium' | 'high';
}

const PetReminders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [reminders, setReminders] = useState<PetReminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New reminder form
  const [newReminder, setNewReminder] = useState({
    reminder_type: 'feeding',
    title: '',
    description: '',
    scheduled_time: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    frequency: 'daily',
    priority: 'medium',
    pet_voice_message: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPet) {
      loadReminders();
    }
  }, [selectedPet]);

  const loadPets = async () => {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (error) throw error;
      setPets(data || []);
      if (data && data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

  const loadReminders = async () => {
    if (!selectedPet) return;
    
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockReminders: PetReminder[] = [
        {
          id: '1',
          pet_id: selectedPet.id,
          reminder_type: 'feeding',
          title: 'Hora del desayuno',
          description: 'Es hora de alimentar a tu mascota',
          scheduled_time: '08:00',
          scheduled_date: new Date().toISOString().split('T')[0],
          frequency: 'daily',
          is_active: true,
          pet_voice_message: '¡Tengo hambre! 🍖 ¿Puedes darme mi desayuno?',
          xp_reward: 5,
          priority: 'high'
        },
        {
          id: '2',
          pet_id: selectedPet.id,
          reminder_type: 'exercise',
          title: 'Tiempo de ejercicio',
          description: 'Vamos a salir a caminar',
          scheduled_time: '18:00',
          scheduled_date: new Date().toISOString().split('T')[0],
          frequency: 'daily',
          is_active: true,
          pet_voice_message: '¡Quiero salir a jugar! 🏃 ¿Vamos de paseo?',
          xp_reward: 8,
          priority: 'medium'
        },
        {
          id: '3',
          pet_id: selectedPet.id,
          reminder_type: 'vet',
          title: 'Cita con el veterinario',
          description: 'Revisión médica mensual',
          scheduled_time: '10:00',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          frequency: 'monthly',
          is_active: true,
          pet_voice_message: 'Necesito ir al doctor 🏥 ¿Me llevas al veterinario?',
          xp_reward: 15,
          priority: 'high'
        }
      ];
      setReminders(mockReminders);
      
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePetVoiceMessage = (type: string, petName: string) => {
    const messages = {
      feeding: [
        `¡Tengo hambre! 🍖 ¿Puedes darme comida?`,
        `Mi pancita hace ruidos 🐾 ¡Es hora de comer!`,
        `¡Por favor, dame de comer! 😋 Estoy muy hambriento`
      ],
      exercise: [
        `¡Quiero salir a jugar! 🏃 ¿Vamos de paseo?`,
        `Estoy aburrido 🎾 ¿Salimos a correr?`,
        `¡Necesito ejercicio! 💪 ¿Jugamos juntos?`
      ],
      vet: [
        `Necesito ir al doctor 🏥 ¿Me llevas al veterinario?`,
        `No me siento muy bien 😷 ¿Podemos ir al doctor?`,
        `¡Es hora del checkup! 🩺 ¿Vamos al veterinario?`
      ],
      play: [
        `¡Quiero jugar contigo! 🎾 ¿Tenemos tiempo?`,
        `Estoy muy aburrido 🎮 ¿Jugamos algo?`,
        `¡Vamos a divertirnos! 🎉 ¿Qué hacemos?`
      ],
      medication: [
        `Es hora de mi medicina 💊 ¿Me la das?`,
        `¡Necesito mis vitaminas! 💉 ¿Puedes ayudarme?`,
        `Mi doctor dijo que tome esto 🏥 ¿Me recuerdas?`
      ],
      grooming: [
        `¡Necesito un baño! 🛁 ¿Me ayudas?`,
        `Mi pelo está muy sucio 🧼 ¿Me cepillas?`,
        `¡Es hora del spa! ✨ ¿Me arreglas?`
      ]
    };
    
    const typeMessages = messages[type as keyof typeof messages] || [`¡Hola! ¿Qué hacemos? 🐾`];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  const handleAddReminder = async () => {
    if (!selectedPet || !newReminder.title || !newReminder.scheduled_time) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const petVoiceMessage = newReminder.pet_voice_message || 
        generatePetVoiceMessage(newReminder.reminder_type, selectedPet.name);

      const reminder: PetReminder = {
        id: Date.now().toString(),
        pet_id: selectedPet.id,
        reminder_type: newReminder.reminder_type as any,
        title: newReminder.title,
        description: newReminder.description,
        scheduled_time: newReminder.scheduled_time,
        scheduled_date: newReminder.scheduled_date,
        frequency: newReminder.frequency as any,
        is_active: true,
        pet_voice_message: petVoiceMessage,
        xp_reward: newReminder.reminder_type === 'vet' ? 15 : 
                   newReminder.reminder_type === 'exercise' ? 8 : 5,
        priority: newReminder.priority as any
      };

      setReminders(prev => [reminder, ...prev]);
      setShowAddForm(false);
      
      toast({
        title: "¡Recordatorio creado! 🔔",
        description: `${selectedPet.name} estará muy agradecido`,
      });

      // Reset form
      setNewReminder({
        reminder_type: 'feeding',
        title: '',
        description: '',
        scheduled_time: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        frequency: 'daily',
        priority: 'medium',
        pet_voice_message: ''
      });

    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el recordatorio",
        variant: "destructive"
      });
    }
  };

  const toggleReminder = (reminderId: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, is_active: !reminder.is_active }
        : reminder
    ));
  };

  const deleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
    toast({
      title: "Recordatorio eliminado",
      description: "El recordatorio ha sido eliminado",
    });
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍖';
      case 'exercise': return '🏃';
      case 'vet': return '🏥';
      case 'play': return '🎾';
      case 'medication': return '💊';
      case 'grooming': return '🧼';
      default: return '🔔';
    }
  };

  const getReminderColor = (type: string) => {
    switch (type) {
      case 'feeding': return 'from-orange-500 to-red-500';
      case 'exercise': return 'from-green-500 to-blue-500';
      case 'vet': return 'from-blue-500 to-purple-500';
      case 'play': return 'from-pink-500 to-purple-500';
      case 'medication': return 'from-yellow-500 to-orange-500';
      case 'grooming': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getPetEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return '🐕';
      case 'cat': return '🐱';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐾';
    }
  };

  if (!selectedPet) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para configurar recordatorios
        </p>
        <Button 
          onClick={() => window.location.href = '/pet-creation'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Crear Mi Primera Mascota
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Pet Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {selectedPet.image_url ? (
                  <img
                    src={selectedPet.image_url}
                    alt={selectedPet.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                    {getPetEmoji(selectedPet.species)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recordatorios de {selectedPet.name}</h2>
                <p className="text-gray-600">Tu mascota te hablará cuando necesite algo</p>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Recordatorio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Reminder Form */}
      {showAddForm && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="w-6 h-6 text-purple-600" />
              🔔 Crear Nuevo Recordatorio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="reminder-type">Tipo de recordatorio</Label>
                <Select value={newReminder.reminder_type} onValueChange={(value) => setNewReminder(prev => ({ ...prev, reminder_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">🍖 Alimentación</SelectItem>
                    <SelectItem value="exercise">🏃 Ejercicio</SelectItem>
                    <SelectItem value="vet">🏥 Veterinario</SelectItem>
                    <SelectItem value="play">🎾 Juego</SelectItem>
                    <SelectItem value="medication">💊 Medicamento</SelectItem>
                    <SelectItem value="grooming">🧼 Aseo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Hora del desayuno"
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={newReminder.priority} onValueChange={(value) => setNewReminder(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="high">🔴 Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="scheduled-date">Fecha</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={newReminder.scheduled_date}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="scheduled-time">Hora</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={newReminder.scheduled_time}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select value={newReminder.frequency} onValueChange={(value) => setNewReminder(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Una vez</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={newReminder.description}
                onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del recordatorio"
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="pet-voice">Mensaje de voz de la mascota (opcional)</Label>
              <Textarea
                id="pet-voice"
                value={newReminder.pet_voice_message}
                onChange={(e) => setNewReminder(prev => ({ ...prev, pet_voice_message: e.target.value }))}
                placeholder="Deja vacío para generar automáticamente"
                rows={2}
              />
              <p className="text-sm text-gray-500 mt-1">
                Si lo dejas vacío, {selectedPet.name} dirá algo automáticamente
              </p>
            </div>
            
            <div className="flex gap-4 mt-6">
              <Button 
                onClick={handleAddReminder}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Recordatorio
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Reminders */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Bell className="w-6 h-6 text-purple-600" />
            🔔 Recordatorios Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando recordatorios...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-gray-600">No hay recordatorios configurados</p>
              <p className="text-sm text-gray-500 mt-2">¡Crea recordatorios para que tu mascota te recuerde cuando necesita algo!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div key={reminder.id} className={`p-4 rounded-lg border-2 ${
                  reminder.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getReminderColor(reminder.reminder_type)} flex items-center justify-center text-white text-xl`}>
                        {getReminderIcon(reminder.reminder_type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{reminder.title}</h3>
                          <Badge className={
                            reminder.priority === 'high' ? 'bg-red-100 text-red-800' :
                            reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {reminder.priority === 'high' ? 'Alta' :
                             reminder.priority === 'medium' ? 'Media' : 'Baja'}
                          </Badge>
                          {reminder.is_active && (
                            <Badge className="bg-green-100 text-green-800">Activo</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📅 {reminder.scheduled_date}</span>
                          <span>🕐 {reminder.scheduled_time}</span>
                          <span>🔄 {reminder.frequency === 'once' ? 'Una vez' : 
                                reminder.frequency === 'daily' ? 'Diario' :
                                reminder.frequency === 'weekly' ? 'Semanal' : 'Mensual'}</span>
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPetEmoji(selectedPet.species)}</span>
                            <span className="text-sm font-medium text-blue-800">Mensaje de {selectedPet.name}:</span>
                          </div>
                          <p className="text-sm text-blue-700 mt-1">"{reminder.pet_voice_message}"</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">+{reminder.xp_reward} XP</span>
                      </div>
                      
                      <Switch
                        checked={reminder.is_active}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para recordatorios con {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Los recordatorios activos te darán XP cuando los completes</li>
                <li>• {selectedPet.name} te hablará con su propia voz cuando sea hora de algo</li>
                <li>• Los recordatorios de alta prioridad aparecen primero</li>
                <li>• ¡Mantén activos los recordatorios para no olvidar cuidar a tu mascota!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PetReminders;
