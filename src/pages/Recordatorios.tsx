import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Trash2,
  Filter,
  Search,
  Heart,
  Stethoscope,
  Scissors,
  Shield,
  Utensils,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { useNavigation } from '@/contexts/NavigationContext';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  image_url?: string;
}

interface Reminder {
  id: string;
  owner_id: string;
  pet_id: string;
  title: string;
  description: string;
  reminder_type: 'medical' | 'care' | 'administrative' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  due_time?: string;
  is_recurring: boolean;
  recurring_interval?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  pet?: Pet;
}

const Recordatorios: React.FC = () => {
  const { user } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu } = useNavigation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPet, setFilterPet] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Form state for creating/editing reminders
  const [formData, setFormData] = useState({
    pet_id: '',
    title: '',
    description: '',
    reminder_type: 'custom' as 'medical' | 'care' | 'administrative' | 'custom',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
    due_time: '',
    is_recurring: false,
    recurring_interval: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
  });

  const reminderTypes = [
    { value: 'medical', label: 'Médico', icon: Stethoscope, color: 'text-red-500' },
    { value: 'care', label: 'Cuidado', icon: Scissors, color: 'text-green-500' },
    { value: 'administrative', label: 'Administrativo', icon: Shield, color: 'text-blue-500' },
    { value: 'custom', label: 'Personalizado', icon: Bell, color: 'text-purple-500' }
  ];

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };

  const intervalLabels = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annually: 'Anual'
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user?.id);

      if (petsError) throw petsError;
      setPets(petsData || []);

      // Load reminders from database
      const { data: remindersData, error: remindersError } = await supabase
        .from('pet_reminders')
        .select(`
          *,
          pets (
            id,
            name,
            species,
            breed,
            age,
            image_url
          )
        `)
        .eq('owner_id', user?.id)
        .order('due_date', { ascending: true });

      if (remindersError) {
        console.error('Error loading reminders:', remindersError);
        // If table doesn't exist yet, show a helpful message
        if (remindersError.code === '42P01') {
          toast.error('La tabla de recordatorios no existe. Por favor, ejecuta el esquema de base de datos primero.');
        } else {
          toast.error('Error al cargar los recordatorios');
        }
        setReminders([]);
      } else {
        const remindersWithPets = (remindersData || []).map(reminder => ({
          ...reminder,
          pet: reminder.pets
        }));
        setReminders(remindersWithPets);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    try {
      const { data, error } = await supabase
        .from('pet_reminders')
        .insert({
          owner_id: user?.id,
          pet_id: formData.pet_id,
          title: formData.title,
          description: formData.description,
          reminder_type: formData.reminder_type,
          priority: formData.priority,
          due_date: formData.due_date,
          due_time: formData.due_time || null,
          is_recurring: formData.is_recurring,
          recurring_interval: formData.is_recurring ? formData.recurring_interval : null
        })
        .select(`
          *,
          pets (
            id,
            name,
            species,
            breed,
            age,
            image_url
          )
        `)
        .single();

      if (error) throw error;

      const newReminder = {
        ...data,
        pet: data.pets
      };

      setReminders(prev => [newReminder, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Recordatorio creado exitosamente');
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      if (error.code === '42P01') {
        toast.error('La tabla de recordatorios no existe. Por favor, ejecuta el esquema de base de datos primero.');
      } else {
        toast.error('Error al crear el recordatorio');
      }
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('pet_reminders')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, is_completed: true, completed_at: new Date().toISOString() }
          : reminder
      ));
      toast.success('Recordatorio completado');
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Error al completar el recordatorio');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('pet_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      toast.success('Recordatorio eliminado');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Error al eliminar el recordatorio');
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      pet_id: reminder.pet_id,
      title: reminder.title,
      description: reminder.description,
      reminder_type: reminder.reminder_type,
      priority: reminder.priority,
      due_date: reminder.due_date,
      due_time: reminder.due_time || '',
      is_recurring: reminder.is_recurring,
      recurring_interval: reminder.recurring_interval || 'monthly'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateReminder = async () => {
    if (!editingReminder) return;

    try {
      const { error } = await supabase
        .from('pet_reminders')
        .update({
          pet_id: formData.pet_id,
          title: formData.title,
          description: formData.description,
          reminder_type: formData.reminder_type,
          priority: formData.priority,
          due_date: formData.due_date,
          due_time: formData.due_time || null,
          is_recurring: formData.is_recurring,
          recurring_interval: formData.is_recurring ? formData.recurring_interval : null
        })
        .eq('id', editingReminder.id);

      if (error) throw error;

      // Update local state
      setReminders(prev => prev.map(reminder => 
        reminder.id === editingReminder.id 
          ? { 
              ...reminder, 
              pet_id: formData.pet_id,
              title: formData.title,
              description: formData.description,
              reminder_type: formData.reminder_type,
              priority: formData.priority,
              due_date: formData.due_date,
              due_time: formData.due_time,
              is_recurring: formData.is_recurring,
              recurring_interval: formData.recurring_interval,
              pet: pets.find(p => p.id === formData.pet_id)
            }
          : reminder
      ));

      setIsEditModalOpen(false);
      setEditingReminder(null);
      resetForm();
      toast.success('Recordatorio actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      if (error.code === '42P01') {
        toast.error('La tabla de recordatorios no existe. Por favor, ejecuta el esquema de base de datos primero.');
      } else {
        toast.error('Error al actualizar el recordatorio');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pet_id: '',
      title: '',
      description: '',
      reminder_type: 'custom' as 'medical' | 'care' | 'administrative' | 'custom',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      due_date: '',
      due_time: '',
      is_recurring: false,
      recurring_interval: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
    });
  };

  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reminder.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || reminder.reminder_type === filterType;
    const matchesPriority = filterPriority === 'all' || reminder.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && reminder.is_completed) ||
                         (filterStatus === 'pending' && !reminder.is_completed);
    const matchesPet = filterPet === 'all' || reminder.pet_id === filterPet;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesPet;
  });

  const stats = {
    total: reminders.length,
    completed: reminders.filter(r => r.is_completed).length,
    pending: reminders.filter(r => !r.is_completed).length,
    overdue: reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date()).length,
    medical: reminders.filter(r => r.reminder_type === 'medical').length,
    care: reminders.filter(r => r.reminder_type === 'care').length,
    administrative: reminders.filter(r => r.reminder_type === 'administrative').length
  };

  const getReminderIcon = (type: string) => {
    const reminderType = reminderTypes.find(t => t.value === type);
    return reminderType?.icon || Bell;
  };

  const getReminderColor = (type: string) => {
    const reminderType = reminderTypes.find(t => t.value === type);
    return reminderType?.color || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader 
        title="Recordatorios"
        subtitle="Gestiona recordatorios para el cuidado de tus mascotas"
        gradient="from-purple-600 to-indigo-600"
        showHamburgerMenu={true}
        onToggleHamburger={toggleMobileMenu}
        isHamburgerOpen={isMobileMenuOpen}
      >
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={pets.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Recordatorio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pet_id">Mascota</Label>
                <Select value={formData.pet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, pet_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Vacuna anual"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles del recordatorio..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder_type">Tipo</Label>
                  <Select value={formData.reminder_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, reminder_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Fecha</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_time">Hora</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_recurring">Recordatorio recurrente</Label>
              </div>
              
              {formData.is_recurring && (
                <div>
                  <Label htmlFor="recurring_interval">Intervalo</Label>
                  <Select value={formData.recurring_interval} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurring_interval: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annually">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReminder} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Crear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Recordatorio</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_pet_id">Mascota</Label>
                <Select value={formData.pet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, pet_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit_title">Título</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Vacuna anual"
                />
              </div>
              
              <div>
                <Label htmlFor="edit_description">Descripción</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalles del recordatorio..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_reminder_type">Tipo</Label>
                  <Select value={formData.reminder_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, reminder_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="edit_priority">Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_due_date">Fecha</Label>
                  <Input
                    id="edit_due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_due_time">Hora</Label>
                  <Input
                    id="edit_due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit_is_recurring">Recordatorio recurrente</Label>
              </div>
              
              {formData.is_recurring && (
                <div>
                  <Label htmlFor="edit_recurring_interval">Intervalo</Label>
                  <Select value={formData.recurring_interval} onValueChange={(value: any) => setFormData(prev => ({ ...prev, recurring_interval: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="annually">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingReminder(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateReminder} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Actualizar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </CardTitle>
            {(searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterPet !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPriority('all');
                  setFilterStatus('all');
                  setFilterPet('all');
                }}
                className="text-gray-600"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar recordatorios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filter_pet">Mascota</Label>
              <Select value={filterPet} onValueChange={setFilterPet}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las mascotas</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_type">Tipo</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="medical">Médico</SelectItem>
                  <SelectItem value="care">Cuidado</SelectItem>
                  <SelectItem value="administrative">Administrativo</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_priority">Prioridad</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_status">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReminders.map((reminder) => {
          const IconComponent = getReminderIcon(reminder.reminder_type);
          const isOverdue = !reminder.is_completed && new Date(reminder.due_date) < new Date();
          
          return (
            <Card key={reminder.id} className={`${reminder.is_completed ? 'opacity-60' : ''} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-5 w-5 ${getReminderColor(reminder.reminder_type)}`} />
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  </div>
                  <Badge className={priorityColors[reminder.priority]}>
                    {priorityLabels[reminder.priority]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{reminder.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(reminder.due_date).toLocaleDateString()}</span>
                  {reminder.due_time && (
                    <>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{reminder.due_time}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span>{reminder.pet?.name || 'Mascota no encontrada'}</span>
                </div>
                
                {reminder.is_recurring && (
                  <Badge variant="outline" className="text-xs">
                    Recurrente: {intervalLabels[reminder.recurring_interval as keyof typeof intervalLabels]}
                  </Badge>
                )}
                
                {isOverdue && !reminder.is_completed && (
                  <Badge variant="destructive" className="text-xs">
                    Vencido
                  </Badge>
                )}
                
                <div className="flex justify-end space-x-2">
                  {!reminder.is_completed && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditReminder(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredReminders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterPet !== 'all'
                ? 'No se encontraron recordatorios'
                : 'No hay recordatorios'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all' || filterStatus !== 'all' || filterPet !== 'all'
                ? 'No se encontraron recordatorios con los filtros aplicados.'
                : 'Crea tu primer recordatorio para mantener organizado el cuidado de tus mascotas.'}
            </p>
            {pets.length > 0 ? (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Recordatorio
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                Primero necesitas agregar una mascota en la configuración
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recordatorios;
