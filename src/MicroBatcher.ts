type Job<T> = () => T;
export type BatchProcessor<T> = (jobs: Job<T>[]) => Promise<T[]>;

export class MicroBatcher<T> {
  private readonly batchSize: number;
  private readonly batchFrequency: number;
  private readonly batchProcessor: BatchProcessor<T>;
  private jobQueue: { job: Job<T>; resolve: (result: T) => void; }[] = [];
  private intervalId: NodeJS.Timeout | undefined;

  constructor(
    processor: BatchProcessor<T>,
    batchSize: number,
    batchFrequency: number
  ) {
    this.batchProcessor = processor;
    this.batchSize = batchSize;
    this.batchFrequency = batchFrequency;

    this.startInterval()
  }

  private async startInterval(): Promise<void> {
    this.intervalId = setInterval(() => {
      if (this.jobQueue.length > 0) {
        this.processBatch();
      }
    }, this.batchFrequency)
  }

  private async triggerInstantBatch(): Promise<T[]> {
    if (this.jobQueue.length > 0) {
      // Stop the interval to prevent multiple batches running at the same time
      clearInterval(this.intervalId);
      const results = await this.processBatch()
      this.startInterval()
      return results
    }
    return []
  }

  private async processBatch(): Promise<T[]> {
    const jobsToProcess = this.jobQueue.splice(0, this.batchSize);
    const jobResults = await this.batchProcessor(jobsToProcess.map(({job}) => job));

    jobResults.forEach((jobResult, i) => {
      const {resolve} = jobsToProcess[i];
      resolve(jobResult);
    });
    return jobResults;
  }

  public async submitJob(job: Job<T>): Promise<T> {
    return new Promise(async (resolve) => {
      this.jobQueue.push({job, resolve});

      if (this.jobQueue.length >= this.batchSize) {
        this.triggerInstantBatch()
      }
    });
  }

  public async shutdown(): Promise<T[]> {
    clearInterval(this.intervalId);
    if (this.jobQueue.length == 0) return []
    return await this.processBatch()
  }
}