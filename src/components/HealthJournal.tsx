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
import { useToast } from '../hooks/use-toast';
import { 
  Stethoscope, 
  Heart, 
  Star, 
  Calendar, 
  Plus, 
  CheckCircle,
  AlertCircle,
  Shield,
  Zap,
  Trophy,
  CalendarDays,
  Pill,
  Syringe,
  FileText,
  Activity
} from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  image_url?: string;
}

interface HealthRecord {
  id: string;
  pet_id: string;
  visit_type: 'checkup' | 'vaccination' | 'treatment' | 'emergency' | 'surgery';
  date: string;
  veterinarian: string;
  clinic: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  notes?: string;
  cost?: number;
  follow_up_date?: string;
  health_score: number;
  xp_earned: number;
  pet_mood: string;
}

interface Vaccination {
  id: string;
  name: string;
  date_given: string;
  next_due: string;
  status: 'current' | 'due' | 'overdue';
}

const HealthJournal: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(false);
  const [petHealthScore, setPetHealthScore] = useState(95);
  const [petLevel, setPetLevel] = useState(1);
  const [healthStreak, setHealthStreak] = useState(0);
  const [nextAppointment, setNextAppointment] = useState<string | null>(null);
  
  // Quick health record form
  const [quickHealthForm, setQuickHealthForm] = useState({
    visit_type: 'checkup',
    veterinarian: '',
    clinic: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    cost: ''
  });

  useEffect(() => {
    if (user) {
      loadPets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPet) {
      loadHealthRecords();
      loadVaccinations();
      calculatePetStats();
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

  const loadHealthRecords = async () => {
    if (!selectedPet) return;
    
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockRecords: HealthRecord[] = [
        {
          id: '1',
          pet_id: selectedPet.id,
          visit_type: 'checkup',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          veterinarian: 'Dr. María González',
          clinic: 'Clínica Veterinaria Central',
          diagnosis: 'Salud excelente',
          treatment: 'Revisión general',
          medications: 'Ninguna',
          notes: 'Peso ideal, dientes limpios, pelaje brillante',
          cost: 50,
          health_score: 95,
          xp_earned: 15,
          pet_mood: 'happy'
        },
        {
          id: '2',
          pet_id: selectedPet.id,
          visit_type: 'vaccination',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
          veterinarian: 'Dr. Carlos Ruiz',
          clinic: 'Veterinaria San Miguel',
          diagnosis: 'Vacunación rutinaria',
          treatment: 'Vacuna antirrábica',
          medications: 'Vacuna antirrábica',
          notes: 'Muy valiente durante la vacuna',
          cost: 25,
          health_score: 98,
          xp_earned: 10,
          pet_mood: 'brave'
        }
      ];
      setHealthRecords(mockRecords);
      
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVaccinations = async () => {
    if (!selectedPet) return;
    
    try {
      // Mock vaccination data
      const mockVaccinations: Vaccination[] = [
        {
          id: '1',
          name: 'Antirrábica',
          date_given: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          next_due: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'current'
        },
        {
          id: '2',
          name: 'Pentavalente',
          date_given: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          next_due: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue'
        }
      ];
      setVaccinations(mockVaccinations);
      
    } catch (error) {
      console.error('Error loading vaccinations:', error);
    }
  };

  const calculatePetStats = () => {
    // Calculate health score based on recent visits and vaccinations
    const recentVisits = healthRecords.filter(record => 
      new Date(record.date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );
    
    const avgHealthScore = recentVisits.length > 0 
      ? recentVisits.reduce((sum, record) => sum + record.health_score, 0) / recentVisits.length
      : 95;
    
    setPetHealthScore(Math.round(avgHealthScore));
    setPetLevel(Math.floor(avgHealthScore / 20) + 1);
    
    // Check for overdue vaccinations
    const overdueVaccinations = vaccinations.filter(vacc => vacc.status === 'overdue');
    if (overdueVaccinations.length > 0) {
      setPetHealthScore(prev => Math.max(60, prev - (overdueVaccinations.length * 10)));
    }
    
    // Calculate health streak (days since last health issue)
    const lastIssue = healthRecords.find(record => 
      record.visit_type === 'treatment' || record.visit_type === 'emergency'
    );
    
    if (lastIssue) {
      const daysSinceIssue = Math.floor((Date.now() - new Date(lastIssue.date).getTime()) / (1000 * 60 * 60 * 24));
      setHealthStreak(daysSinceIssue);
    } else {
      setHealthStreak(365); // Assume healthy if no issues recorded
    }
  };

  const handleQuickHealthRecord = async () => {
    if (!selectedPet || !quickHealthForm.veterinarian || !quickHealthForm.clinic) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const newRecord: HealthRecord = {
        id: Date.now().toString(),
        pet_id: selectedPet.id,
        visit_type: quickHealthForm.visit_type as any,
        date: new Date().toISOString(),
        veterinarian: quickHealthForm.veterinarian,
        clinic: quickHealthForm.clinic,
        diagnosis: quickHealthForm.diagnosis,
        treatment: quickHealthForm.treatment,
        medications: quickHealthForm.medications,
        notes: quickHealthForm.notes,
        cost: quickHealthForm.cost ? parseFloat(quickHealthForm.cost) : undefined,
        health_score: 95, // Default high score for proactive care
        xp_earned: quickHealthForm.visit_type === 'checkup' ? 15 : 10,
        pet_mood: 'grateful'
      };

      setHealthRecords(prev => [newRecord, ...prev]);
      setPetHealthScore(prev => Math.min(100, prev + 2));
      setHealthStreak(prev => prev + 1);

      toast({
        title: "¡Registro de salud guardado! 🏥",
        description: `${selectedPet.name} está agradecido por el cuidado. +${newRecord.xp_earned} XP ganado!`,
      });

      // Reset form
      setQuickHealthForm({
        visit_type: 'checkup',
        veterinarian: '',
        clinic: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        cost: ''
      });

    } catch (error) {
      console.error('Error saving health record:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el registro de salud",
        variant: "destructive"
      });
    }
  };

  const getPetHealthMood = () => {
    if (petHealthScore >= 95) return { mood: 'excellent', message: '¡Salud excelente!', icon: '😊', color: 'text-green-500' };
    if (petHealthScore >= 85) return { mood: 'good', message: 'Me siento muy bien', icon: '😌', color: 'text-blue-500' };
    if (petHealthScore >= 70) return { mood: 'okay', message: 'Estoy bien', icon: '😐', color: 'text-yellow-500' };
    if (petHealthScore >= 50) return { mood: 'concern', message: 'No me siento muy bien', icon: '😕', color: 'text-orange-500' };
    return { mood: 'sick', message: 'Necesito ver al doctor', icon: '😷', color: 'text-red-500' };
  };

  const getVisitTypeIcon = (visitType: string) => {
    switch (visitType) {
      case 'checkup': return '🩺';
      case 'vaccination': return '💉';
      case 'treatment': return '🏥';
      case 'emergency': return '🚨';
      case 'surgery': return '🔬';
      default: return '🏥';
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

  const petHealthMood = getPetHealthMood();

  if (!selectedPet) {
    return (
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🏥</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡No tienes mascotas aún!
        </h2>
        <p className="text-gray-600 mb-6">
          Crea tu primera mascota para comenzar su historial de salud
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
      {/* Pet Health Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white text-2xl border-4 border-white shadow-lg">
                    {getPetEmoji(selectedPet.species)}
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-800">{petLevel}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${petHealthMood.color}`}>{petHealthMood.icon}</span>
                  <span className="text-gray-600">{petHealthMood.message}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center space-x-1">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-gray-900">{petHealthScore}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-gray-900">{healthStreak} días</span>
                </div>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    petHealthScore >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    petHealthScore >= 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}
                  style={{ width: `${petHealthScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vaccination Status */}
      {vaccinations.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Syringe className="w-6 h-6 text-blue-600" />
              💉 Estado de Vacunaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vaccinations.map((vaccination) => (
                <div key={vaccination.id} className={`p-4 rounded-lg border-2 ${
                  vaccination.status === 'current' ? 'bg-green-50 border-green-200' :
                  vaccination.status === 'due' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{vaccination.name}</h3>
                      <p className="text-sm text-gray-600">
                        Próxima: {new Date(vaccination.next_due).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={
                      vaccination.status === 'current' ? 'bg-green-100 text-green-800' :
                      vaccination.status === 'due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {vaccination.status === 'current' ? 'Al día' :
                       vaccination.status === 'due' ? 'Próxima' : 'Vencida'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Health Record Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            🏥 Registrar Visita Médica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="visit-type">Tipo de visita</Label>
              <Select value={quickHealthForm.visit_type} onValueChange={(value) => setQuickHealthForm(prev => ({ ...prev, visit_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">🩺 Revisión general</SelectItem>
                  <SelectItem value="vaccination">💉 Vacunación</SelectItem>
                  <SelectItem value="treatment">🏥 Tratamiento</SelectItem>
                  <SelectItem value="emergency">🚨 Emergencia</SelectItem>
                  <SelectItem value="surgery">🔬 Cirugía</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input
                id="veterinarian"
                value={quickHealthForm.veterinarian}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Dr. María González"
              />
            </div>
            
            <div>
              <Label htmlFor="clinic">Clínica</Label>
              <Input
                id="clinic"
                value={quickHealthForm.clinic}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, clinic: e.target.value }))}
                placeholder="Clínica Veterinaria"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              <Input
                id="diagnosis"
                value={quickHealthForm.diagnosis}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Salud excelente"
              />
            </div>
            
            <div>
              <Label htmlFor="treatment">Tratamiento</Label>
              <Input
                id="treatment"
                value={quickHealthForm.treatment}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="Revisión general"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="medications">Medicamentos</Label>
              <Input
                id="medications"
                value={quickHealthForm.medications}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, medications: e.target.value }))}
                placeholder="Ninguna"
              />
            </div>
            
            <div>
              <Label htmlFor="cost">Costo ($)</Label>
              <Input
                id="cost"
                type="number"
                value={quickHealthForm.cost}
                onChange={(e) => setQuickHealthForm(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="50"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={quickHealthForm.notes}
              onChange={(e) => setQuickHealthForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="¿Cómo se comportó tu mascota? ¿Algún detalle importante?"
              rows={3}
            />
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleQuickHealthRecord}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Guardar Registro de Salud
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Stethoscope className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthRecords.length}</div>
            <div className="text-sm opacity-90">Visitas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petHealthScore}%</div>
            <div className="text-sm opacity-90">Salud</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthStreak}</div>
            <div className="text-sm opacity-90">Días sanos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{petLevel}</div>
            <div className="text-sm opacity-90">Nivel</div>
          </CardContent>
        </Card>
      </div>

      {/* Health Records History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="w-6 h-6 text-blue-600" />
            📋 Historial de Salud
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          ) : healthRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏥</div>
              <p className="text-gray-600">Aún no hay registros de salud</p>
              <p className="text-sm text-gray-500 mt-2">¡Lleva a tu mascota al veterinario para comenzar el historial!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {healthRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getVisitTypeIcon(record.visit_type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 capitalize">{record.visit_type}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {record.veterinarian}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()} • {record.clinic}
                      </div>
                      {record.diagnosis && (
                        <div className="text-sm text-gray-600 mt-1">
                          🩺 {record.diagnosis}
                        </div>
                      )}
                      {record.notes && (
                        <div className="text-sm text-gray-600 mt-1">
                          💬 {record.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">+{record.xp_earned} XP</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">{record.health_score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consejos para mantener saludable a {selectedPet.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Lleva a {selectedPet.name} a revisiones regulares para mantener su salud</li>
                <li>• Mantén las vacunaciones al día para prevenir enfermedades</li>
                <li>• Cada visita médica aumenta su puntuación de salud y te da XP</li>
                <li>• ¡Un historial médico completo te ayuda a ganar logros especiales!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthJournal;
