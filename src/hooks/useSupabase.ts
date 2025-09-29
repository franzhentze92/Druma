import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Pet = Database['public']['Tables']['pets']['Row']
type PetInsert = Database['public']['Tables']['pets']['Insert']
type PetUpdate = Database['public']['Tables']['pets']['Update']

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

type HealthRecord = Database['public']['Tables']['health_records']['Row']
type HealthRecordInsert = Database['public']['Tables']['health_records']['Insert']
type HealthRecordUpdate = Database['public']['Tables']['health_records']['Update']

// Pets hooks
export const usePets = (ownerId?: string) => {
  return useQuery({
    queryKey: ['pets', ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!ownerId,
  })
}

export const usePet = (petId: string) => {
  return useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!petId,
  })
}

export const useCreatePet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pet: PetInsert) => {
      const { data, error } = await supabase
        .from('pets')
        .insert(pet)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets', data.owner_id] })
    },
  })
}

export const useUpdatePet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...pet }: PetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pets', data.owner_id] })
      queryClient.invalidateQueries({ queryKey: ['pet', data.id] })
    },
  })
}

export const useDeletePet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (petId: string) => {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)

      if (error) throw error
      return petId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

// Appointments hooks
export const useAppointments = (petId?: string) => {
  return useQuery({
    queryKey: ['appointments', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('pet_id', petId)
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!petId,
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', data.pet_id] })
    },
  })
}

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...appointment }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointment)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', data.pet_id] })
    },
  })
}

// Health records hooks
export const useHealthRecords = (petId?: string) => {
  return useQuery({
    queryKey: ['health_records', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!petId,
  })
}

export const useCreateHealthRecord = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (record: HealthRecordInsert) => {
      const { data, error } = await supabase
        .from('health_records')
        .insert(record)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health_records', data.pet_id] })
    },
  })
}

// Auth hooks
export const useAuth = () => {
  return useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    },
  })
}

export const useSignIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useSignUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useSignOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.clear()
    },
  })
}
