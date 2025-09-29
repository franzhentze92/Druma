import { FeedingScheduleService } from './FeedingScheduleService';

class AutoCompleteService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the auto-complete service
  start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log('Auto-complete service is already running');
      return;
    }

    console.log(`Starting auto-complete service (checking every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Check immediately
    this.checkAndCompleteOverdueMeals();

    // Then check at regular intervals
    this.intervalId = setInterval(() => {
      this.checkAndCompleteOverdueMeals();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
  }

  // Stop the auto-complete service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Auto-complete service stopped');
  }

  // Check for overdue meals and auto-complete them
  private async checkAndCompleteOverdueMeals() {
    try {
      console.log('Checking for overdue meals...');
      const completedCount = await FeedingScheduleService.autoCompleteOverdueMeals();
      
      if (completedCount > 0) {
        console.log(`Auto-completed ${completedCount} overdue meals`);
        
        // You could add a notification here if needed
        // this.showNotification(`Auto-completed ${completedCount} meals`);
      } else {
        console.log('No overdue meals found');
      }
    } catch (error) {
      console.error('Error in auto-complete service:', error);
    }
  }

  // Manual trigger for testing
  async triggerCheck() {
    await this.checkAndCompleteOverdueMeals();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null
    };
  }
}

// Create a singleton instance
export const autoCompleteService = new AutoCompleteService();

// Auto-start the service when the module is imported
// This will start checking every 5 minutes
// Note: Run the SQL script first to create the auto_complete_overdue_meals function
autoCompleteService.start(5);

export default AutoCompleteService;
