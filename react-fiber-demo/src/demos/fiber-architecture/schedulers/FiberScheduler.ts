export class FiberScheduler {
  private workInProgress: Generator | null = null;
  private deadline: number = 0;
  private taskQueue: Array<() => Generator> = [];
  private static FRAME_BUDGET = 16;

  scheduleWork(task: () => Generator) {
    this.taskQueue.push(task);
    this.requestIdleCallback();
  }

  private requestIdleCallback() {
    requestAnimationFrame((timestamp) => {
      this.deadline = timestamp + FiberScheduler.FRAME_BUDGET;
      this.workLoop();
    });
  }

  private workLoop() {
    if (!this.workInProgress && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        this.workInProgress = task();
      }
    }

    while (this.workInProgress && this.shouldYield() === false) {
      const result = this.workInProgress.next();
      if (result.done) {
        this.workInProgress = null;
        break;
      }
    }

    if (this.workInProgress || this.taskQueue.length > 0) {
      this.requestIdleCallback();
    }
  }

  private shouldYield(): boolean {
    return performance.now() >= this.deadline;
  }
}

