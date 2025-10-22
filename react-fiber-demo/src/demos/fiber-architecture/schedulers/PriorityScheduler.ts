import { Priority, Task } from '../types/fiber.types';

export class PriorityScheduler {
  private tasks: Task[] = [];
  private currentTask: Task | null = null;
  private isRunning = false;

  addTask(task: Task) {
    this.tasks.push(task);
    this.tasks.sort((a, b) => a.priority - b.priority);
    
    if (!this.isRunning) {
      this.schedule();
    }
  }

  private schedule() {
    if (this.tasks.length === 0) {
      this.isRunning = false;
      return;
    }

    this.isRunning = true;
    this.currentTask = this.tasks.shift() || null;

    if (this.currentTask) {
      if (this.currentTask.priority === Priority.IMMEDIATE) {
        this.currentTask.execute();
        this.schedule();
      } else {
        requestAnimationFrame(() => {
          if (this.currentTask) {
            this.currentTask.execute();
          }
          this.schedule();
        });
      }
    }
  }

  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  getPendingTasks(): Task[] {
    return this.tasks;
  }
}

