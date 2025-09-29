import { supabase } from '../lib/supabase';

export interface FeedingSchedule {
  id: string;
  owner_id: string;
  pet_id: string;
  schedule_name: string;
  is_active: boolean;
  feeding_times: Array<{
    time: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food_id: string;
    quantity_grams: number;
  }>;
  days_of_week: number[];
  start_date: string;
  end_date?: string;
  auto_generate_meals: boolean;
  send_notifications: boolean;
  notification_minutes_before: number;
  auto_complete_enabled: boolean;
  auto_complete_minutes_after: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomatedMeal {
  id: string;
  owner_id: string;
  pet_id: string;
  schedule_id: string;
  scheduled_date: string;
  scheduled_time: string;
  meal_type: string;
  food_id: string;
  quantity_grams: number;
  status: 'scheduled' | 'completed' | 'skipped' | 'modified';
  completed_at?: string;
  completed_by?: string;
  actual_quantity_grams?: number;
  actual_food_id?: string;
  actual_meal_type?: string;
  actual_notes?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  fat_per_100g?: number;
  carbs_per_100g?: number;
  fiber_per_100g?: number;
  total_calories?: number;
  total_protein?: number;
  total_fat?: number;
  total_carbs?: number;
  total_fiber?: number;
  created_at: string;
  updated_at: string;
}

export interface PetFood {
  id: string;
  name: string;
  brand: string;
  food_type: string;
  species: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  ash_per_100g: number;
  moisture_per_100g: number;
}

export class FeedingScheduleService {
  // Generate meals for a specific date from all active schedules
  static async generateMealsForDate(date: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('generate_daily_meals_from_schedules', {
        target_date: date
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error generating meals for date:', error);
      throw error;
    }
  }

  // Generate meals for multiple dates
  static async generateMealsForDateRange(startDate: string, endDate: string): Promise<number> {
    try {
      let totalGenerated = 0;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const generated = await this.generateMealsForDate(dateStr);
        totalGenerated += generated;
      }
      
      return totalGenerated;
    } catch (error) {
      console.error('Error generating meals for date range:', error);
      throw error;
    }
  }

  // Get feeding schedules for a user
  static async getFeedingSchedules(userId: string): Promise<FeedingSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('pet_feeding_schedules')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching feeding schedules:', error);
      throw error;
    }
  }

  // Create a new feeding schedule
  static async createFeedingSchedule(schedule: Omit<FeedingSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<FeedingSchedule> {
    try {
      const { data, error } = await supabase
        .from('pet_feeding_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating feeding schedule:', error);
      throw error;
    }
  }

  // Update a feeding schedule
  static async updateFeedingSchedule(id: string, updates: Partial<FeedingSchedule>): Promise<FeedingSchedule> {
    try {
      const { data, error } = await supabase
        .from('pet_feeding_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating feeding schedule:', error);
      throw error;
    }
  }

  // Delete a feeding schedule
  static async deleteFeedingSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pet_feeding_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting feeding schedule:', error);
      throw error;
    }
  }

  // Get automated meals for a specific date
  static async getAutomatedMealsForDate(userId: string, date: string): Promise<AutomatedMeal[]> {
    try {
      const { data, error } = await supabase
        .from('automated_meals')
        .select(`
          *,
          pets (name, species),
          pet_foods!automated_meals_food_id_fkey (name, brand, food_type)
        `)
        .eq('owner_id', userId)
        .eq('scheduled_date', date)
        .order('scheduled_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching automated meals:', error);
      throw error;
    }
  }

  // Mark a meal as completed
  static async markMealAsCompleted(mealId: string, userId: string, actualData?: {
    quantity_grams?: number;
    food_id?: string;
    meal_type?: string;
    notes?: string;
  }): Promise<AutomatedMeal> {
    try {
      // Get the meal data first to calculate nutritional values
      const { data: mealData, error: fetchError } = await supabase
        .from('automated_meals')
        .select(`
          *,
          pet_foods!automated_meals_food_id_fkey (calories_per_100g, protein_per_100g, fat_per_100g, fiber_per_100g, ash_per_100g, moisture_per_100g)
        `)
        .eq('id', mealId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate nutritional values
      const foodData = mealData.pet_foods;
      const quantity = actualData?.quantity_grams || mealData.quantity_grams;
      const multiplier = quantity / 100; // Convert to per 100g basis

      const nutritionalValues = {
        calories_per_100g: foodData.calories_per_100g,
        protein_per_100g: foodData.protein_per_100g,
        fat_per_100g: foodData.fat_per_100g,
        fiber_per_100g: foodData.fiber_per_100g,
        carbs_per_100g: 100 - foodData.protein_per_100g - foodData.fat_per_100g - foodData.fiber_per_100g - foodData.ash_per_100g - foodData.moisture_per_100g,
        total_calories: Math.round(foodData.calories_per_100g * multiplier),
        total_protein: Math.round(foodData.protein_per_100g * multiplier * 10) / 10,
        total_fat: Math.round(foodData.fat_per_100g * multiplier * 10) / 10,
        total_carbs: Math.round((100 - foodData.protein_per_100g - foodData.fat_per_100g - foodData.fiber_per_100g - foodData.ash_per_100g - foodData.moisture_per_100g) * multiplier * 10) / 10,
        total_fiber: Math.round(foodData.fiber_per_100g * multiplier * 10) / 10
      };

      // Update the meal
      const { data, error } = await supabase
        .from('automated_meals')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: userId,
          actual_quantity_grams: actualData?.quantity_grams,
          actual_food_id: actualData?.food_id,
          actual_meal_type: actualData?.meal_type,
          actual_notes: actualData?.notes,
          ...nutritionalValues
        })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;

      // Also insert into nutrition_sessions for tracking
      await this.insertIntoNutritionSessions(mealData, actualData, nutritionalValues);

      return data;
    } catch (error) {
      console.error('Error marking meal as completed:', error);
      throw error;
    }
  }

  // Insert completed meal into nutrition_sessions for analytics
  private static async insertIntoNutritionSessions(
    mealData: any, 
    actualData: any, 
    nutritionalValues: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('nutrition_sessions')
        .insert({
          owner_id: mealData.owner_id,
          pet_id: mealData.pet_id,
          date: mealData.scheduled_date,
          meal_type: actualData?.meal_type || mealData.meal_type,
          food_name: mealData.pet_foods?.name || '',
          food_category: mealData.pet_foods?.food_type || 'dry_food',
          quantity_grams: actualData?.quantity_grams || mealData.quantity_grams,
          calories_per_100g: nutritionalValues.calories_per_100g,
          protein_per_100g: nutritionalValues.protein_per_100g,
          fat_per_100g: nutritionalValues.fat_per_100g,
          carbs_per_100g: nutritionalValues.carbs_per_100g,
          fiber_per_100g: nutritionalValues.fiber_per_100g,
          total_calories: nutritionalValues.total_calories,
          total_protein: nutritionalValues.total_protein,
          total_fat: nutritionalValues.total_fat,
          total_carbs: nutritionalValues.total_carbs,
          total_fiber: nutritionalValues.total_fiber,
          notes: actualData?.notes || `Comida automática - ${mealData.schedule_id}`,
          feeding_time: mealData.scheduled_time
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error inserting into nutrition_sessions:', error);
      // Don't throw here as this is supplementary data
    }
  }

  // Skip a meal
  static async skipMeal(mealId: string, userId: string, reason?: string): Promise<AutomatedMeal> {
    try {
      const { data, error } = await supabase
        .from('automated_meals')
        .update({
          status: 'skipped',
          completed_at: new Date().toISOString(),
          completed_by: userId,
          actual_notes: reason || 'Comida omitida'
        })
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error skipping meal:', error);
      throw error;
    }
  }

  // Get upcoming meals for notifications
  static async getUpcomingMeals(userId: string, hoursAhead: number = 24): Promise<AutomatedMeal[]> {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('automated_meals')
        .select(`
          *,
          pets (name),
          pet_foods!automated_meals_food_id_fkey (name, brand),
          pet_feeding_schedules (schedule_name, send_notifications, notification_minutes_before)
        `)
        .eq('owner_id', userId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', now.toISOString().split('T')[0])
        .lte('scheduled_date', futureTime.toISOString().split('T')[0])
        .order('scheduled_date')
        .order('scheduled_time');

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('Automated meals table not found, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching upcoming meals:', error);
      throw error;
    }
  }

  // Create notification for upcoming meal
  static async createMealNotification(mealId: string, userId: string): Promise<void> {
    try {
      const { data: meal, error: fetchError } = await supabase
        .from('automated_meals')
        .select(`
          *,
          pets (name),
          pet_feeding_schedules (schedule_name, notification_minutes_before)
        `)
        .eq('id', mealId)
        .single();

      if (fetchError) throw fetchError;

      const notificationTime = new Date(`${meal.scheduled_date}T${meal.scheduled_time}`);
      notificationTime.setMinutes(notificationTime.getMinutes() - meal.pet_feeding_schedules.notification_minutes_before);

      const { error } = await supabase
        .from('feeding_schedule_notifications')
        .insert({
          owner_id: userId,
          pet_id: meal.pet_id,
          schedule_id: meal.schedule_id,
          meal_id: mealId,
          notification_type: 'upcoming_feeding',
          scheduled_time: notificationTime.toISOString(),
          message: `Es hora de alimentar a ${meal.pets.name} - ${meal.pet_feeding_schedules.schedule_name}`,
          status: 'pending'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating meal notification:', error);
      throw error;
    }
  }

  // Auto-complete overdue meals
  static async autoCompleteOverdueMeals(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('auto_complete_overdue_meals');

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error auto-completing overdue meals:', error);
      throw error;
    }
  }

  // Get pet foods for a specific species
  static async getPetFoods(species: string): Promise<PetFood[]> {
    try {
      const { data, error } = await supabase
        .from('pet_foods')
        .select('*')
        .eq('species', species)
        .eq('is_available', true)
        .order('brand')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pet foods:', error);
      throw error;
    }
  }
}

export default FeedingScheduleService;
