import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export type Shelter = Database['public']['Tables']['shelters']['Row']
export type ShelterInsert = Database['public']['Tables']['shelters']['Insert']
export type ShelterUpdate = Database['public']['Tables']['shelters']['Update']

export type AdoptionPet = Database['public']['Tables']['adoption_pets']['Row']
export type AdoptionPetInsert = Database['public']['Tables']['adoption_pets']['Insert']
export type AdoptionPetUpdate = Database['public']['Tables']['adoption_pets']['Update']

export type AdoptionApplication = Database['public']['Tables']['adoption_applications']['Row']
export type AdoptionApplicationInsert = Database['public']['Tables']['adoption_applications']['Insert']
export type AdoptionApplicationUpdate = Database['public']['Tables']['adoption_applications']['Update']

export type AdoptionFavorite = Database['public']['Tables']['adoption_favorites']['Row']
export type AdoptionSwipe = Database['public']['Tables']['adoption_swipes']['Row']

// Shelters
export const useShelters = () => {
  return useQuery({
    queryKey: ['shelters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shelters')
        .select(`
          *,
          shelter_images!left (
            id,
            image_url,
            is_primary,
            display_order
          )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      
      // Process the data to get the primary image or first image
      return data.map(shelter => {
        const images = shelter.shelter_images || []
        const primaryImage = images.find(img => img.is_primary) || images[0]
        
        return {
          ...shelter,
          primary_image_url: primaryImage?.image_url || shelter.image_url
        }
      })
    },
  })
}

export const useCreateShelter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (shelter: ShelterInsert) => {
      const { data, error } = await supabase
        .from('shelters')
        .insert(shelter)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelters'] }),
  })
}

export const useUpdateShelter = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: ShelterUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('shelters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelters'] }),
  })
}

// Adoption pets (with shelters join)
export const useAdoptionPets = (filters?: { species?: string; size?: string }) => {
  return useQuery({
    queryKey: ['adoption_pets', filters],
    queryFn: async () => {
      let query = supabase
        .from('adoption_pets')
        .select('*, shelters(name)')
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      if (filters?.species) query = query.eq('species', filters.species)
      if (filters?.size) query = query.eq('size', filters.size)

      const { data, error } = await query
      if (error) throw error
      return data as Array<AdoptionPet & { shelters: { name: string } | null }>
    },
  })
}

export const useCreateAdoptionPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pet: AdoptionPetInsert) => {
      const { data, error } = await supabase
        .from('adoption_pets')
        .insert(pet)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adoption_pets'] }),
  })
}

export const useUpdateAdoptionPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: AdoptionPetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('adoption_pets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adoption_pets'] }),
  })
}

export const useDeleteAdoptionPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('adoption_pets')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adoption_pets'] }),
  })
}

// Favorites
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ petId, userId, isFavorite }: { petId: string; userId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from('adoption_favorites')
          .delete()
          .eq('pet_id', petId)
          .eq('user_id', userId)
        if (error) throw error
        return { petId, userId, isFavorite: false }
      }
      const { data, error } = await supabase
        .from('adoption_favorites')
        .insert({ pet_id: petId, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adoption_favorites'] }),
  })
}

export const useMyFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ['adoption_favorites', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adoption_favorites')
        .select('pet_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map((r) => r.pet_id)
    },
    enabled: !!userId,
  })
}

// Applications
export const useApplyToPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AdoptionApplicationInsert) => {
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my_applications'] }),
  })
}

export const useMyApplications = (userId?: string) => {
  return useQuery({
    queryKey: ['my_applications', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*, adoption_pets(*)')
        .eq('applicant_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useApplicationsForMyPets = (ownerId?: string) => {
  return useQuery({
    queryKey: ['applications_for_my_pets', ownerId],
    queryFn: async () => {
      const petIds = (await supabase.from('adoption_pets').select('id').eq('owner_id', ownerId)).data?.map(p => p.id) || []
      if (petIds.length === 0) return []
      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*, adoption_pets(*)')
        .in('pet_id', petIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!ownerId,
  })
}

// Swipes
export const useSwipePet = () => {
  return useMutation({
    mutationFn: async ({ petId, userId, direction }: { petId: string; userId: string; direction: 'left' | 'right' }) => {
      const { data, error } = await supabase
        .from('adoption_swipes')
        .insert({ pet_id: petId, user_id: userId, direction })
        .select()
        .single()
      if (error) throw error
      return data
    },
  })
}

// Shelter favorites
export const useToggleShelterFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ shelterId, userId, isFavorite }: { shelterId: string; userId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from('shelter_favorites')
          .delete()
          .eq('shelter_id', shelterId)
          .eq('user_id', userId)
        if (error) throw error
        return { shelterId, userId, isFavorite: false }
      }
      const { data, error } = await supabase
        .from('shelter_favorites')
        .insert({ shelter_id: shelterId, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shelter_favorites'] }),
  })
}

export const useMyShelterFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ['shelter_favorites', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shelter_favorites')
        .select('shelter_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map((r) => r.shelter_id)
    },
    enabled: !!userId,
  })
}

// Get single shelter by owner ID (user ID)
export const useShelter = (userId?: string) => {
  return useQuery({
    queryKey: ['shelter', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('owner_id', userId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Get single shelter by shelter ID
export const useShelterById = (shelterId?: string) => {
  return useQuery({
    queryKey: ['shelter-by-id', shelterId],
    queryFn: async () => {
      if (!shelterId) return null
      
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('id', shelterId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!shelterId,
  })
}

// Lost Pets
export const useLostPets = () => {
  return useQuery({
    queryKey: ['lost_pets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lost_pets')
        .select('*')
        .eq('status', 'lost')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export const useCreateLostPet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lostPet: any) => {
      const { data, error } = await supabase
        .from('lost_pets')
        .insert(lostPet)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost_pets'] }),
  })
}

// Get adoption pets by shelter owner (user ID)
export const useAdoptionPetsByShelter = (userId?: string) => {
  return useQuery({
    queryKey: ['adoption_pets_by_shelter', userId],
    queryFn: async () => {
      if (!userId) return []
      
      // First get the shelter ID for this user
      const { data: shelter, error: shelterError } = await supabase
        .from('shelters')
        .select('id')
        .eq('owner_id', userId)
        .single()
      
      if (shelterError || !shelter) return []
      
      // Then get pets for this shelter
      const { data, error } = await supabase
        .from('adoption_pets')
        .select('*')
        .eq('shelter_id', shelter.id)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Hook to fetch shelter images by owner (user ID)
export const useShelterImages = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['shelter-images', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get the shelter ID for this user
      const { data: shelter, error: shelterError } = await supabase
        .from('shelters')
        .select('id')
        .eq('owner_id', userId)
        .single()
      
      if (shelterError || !shelter) return [];
      
      const { data, error } = await supabase
        .from('shelter_images')
        .select('*')
        .eq('shelter_id', shelter.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook to fetch shelter videos by owner (user ID)
export const useShelterVideos = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['shelter-videos', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get the shelter ID for this user
      const { data: shelter, error: shelterError } = await supabase
        .from('shelters')
        .select('id')
        .eq('owner_id', userId)
        .single()
      
      if (shelterError || !shelter) return [];
      
      const { data, error } = await supabase
        .from('shelter_videos')
        .select('*')
        .eq('shelter_id', shelter.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook to get adoption applications for a specific shelter owner (user ID)
export const useShelterAdoptionApplications = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['shelter-adoption-applications', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // First get the shelter ID for this user
      const { data: shelter, error: shelterError } = await supabase
        .from('shelters')
        .select('id')
        .eq('owner_id', userId)
        .single()
      
      if (shelterError || !shelter) return [];
      
      // Then get all pets from this shelter
      const { data: shelterPets, error: petsError } = await supabase
        .from('adoption_pets')
        .select('id, name')
        .eq('shelter_id', shelter.id);
      
      if (petsError) throw petsError;
      if (!shelterPets || shelterPets.length === 0) return [];
      
      const petIds = shelterPets.map(pet => pet.id);
      
      // Then get all applications for these pets
      const { data, error } = await supabase
        .from('adoption_applications')
        .select(`
          *,
          adoption_pets!inner(name)
        `)
        .in('pet_id', petIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get user profiles for all applicants
      const applicantIds = data?.map(app => app.applicant_id) || [];
      let userProfiles = {};
      
      if (applicantIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, phone')
          .in('user_id', applicantIds);
        
        // Create a map for quick lookup
        userProfiles = profiles?.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, any>) || {};
      }
      
      // Transform the data to include pet and applicant names
      return data?.map(app => ({
        ...app,
        pet_name: app.adoption_pets?.name,
        applicant_name: userProfiles[app.applicant_id]?.full_name || 'Usuario Anónimo',
        applicant_email: userProfiles[app.applicant_id]?.email || '',
        applicant_phone: userProfiles[app.applicant_id]?.phone || ''
      })) || [];
    },
    enabled: !!userId,
  });
};

// Hook to update adoption application status
export const useUpdateAdoptionApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      shelterId 
    }: { 
      applicationId: string; 
      status: 'approved' | 'rejected'; 
      shelterId: string;
    }) => {
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ applicationId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['shelter-adoption-applications'] });
      
      // Snapshot the previous value
      const previousApplications = queryClient.getQueriesData({ queryKey: ['shelter-adoption-applications'] });
      
      // Optimistically update the application status
      queryClient.setQueriesData({ queryKey: ['shelter-adoption-applications'] }, (old: any) => {
        if (!old) return old;
        return old.map((app: any) => 
          app.id === applicationId 
            ? { ...app, status }
            : app
        );
      });
      
      return { previousApplications };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousApplications) {
        context.previousApplications.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: ['shelter-adoption-applications'] 
      });
      
      // Also invalidate the general adoption applications query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-applications'] 
      });
      
      // Invalidate my applications queries
      queryClient.invalidateQueries({ 
        queryKey: ['my_applications'] 
      });
    },
  });
};

// Hook to add a new pet to a shelter
export const useAddShelterPet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (petData: {
      name: string;
      species?: string;
      breed?: string;
      age?: number;
      size?: string;
      sex?: string;
      color?: string;
      weight?: number;
      description?: string;
      image_url?: string;
      good_with_kids?: boolean;
      good_with_dogs?: boolean;
      good_with_cats?: boolean;
      house_trained?: boolean;
      spayed_neutered?: boolean;
      special_needs?: boolean;
      special_needs_description?: string;
      medical_notes?: string;
      adoption_fee?: string;
      location?: string;
      status?: string;
      shelter_id: string;
      owner_id: string;
    }) => {
      const { data, error } = await supabase
        .from('adoption_pets')
        .insert(petData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the shelter pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets-by-shelter', data.owner_id] 
      });
      
      // Also invalidate the general adoption pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets'] 
      });
    },
  });
};

// Hook to update a shelter pet
export const useUpdateShelterPet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      petId, 
      petData 
    }: { 
      petId: string; 
      petData: Partial<Database['public']['Tables']['adoption_pets']['Update']>;
    }) => {
      const { data, error } = await supabase
        .from('adoption_pets')
        .update(petData)
        .eq('id', petId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the shelter pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets-by-shelter', data.owner_id] 
      });
      
      // Also invalidate the general adoption pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets'] 
      });
    },
  });
};

// Hook to delete a shelter pet
export const useDeleteShelterPet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      petId, 
      shelterId 
    }: { 
      petId: string; 
      shelterId: string;
    }) => {
      const { error } = await supabase
        .from('adoption_pets')
        .delete()
        .eq('id', petId);
      
      if (error) throw error;
      return { petId, shelterId };
    },
    onSuccess: (data) => {
      // Invalidate the shelter pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets-by-shelter', data.shelterId] 
      });
      
      // Also invalidate the general adoption pets query
      queryClient.invalidateQueries({ 
        queryKey: ['adoption-pets'] 
      });
    },
  });
};
