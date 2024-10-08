type Job = () => any;
type JobResult = any;
type BatchProcessor = (jobs: Job[]) => Promise<JobResult[]>;

interface MicroBatcher {
  submitJob: (job: Job) => Promise<JobResult>;
  shutdown: () => Promise<void>;
}

// MicroBatcher accepts the following parameters
// - processor: The function that processes the jobs
// - batchSize: The maximum number of jobs to process in a single batch
// - interval: The maximum time to wait before processing a batch
class MicroBatcher implements MicroBatcher {
  private batchSize: number
  private batchFrequency: number
  private batchProcessor: BatchProcessor
  private jobQeueue: Job[] = []

  constructor(
    processor: BatchProcessor,
    batchSize: number,
    batchFrequency: number
  ) {
    this.batchProcessor = processor;
    this.batchSize = batchSize;
    this.batchFrequency = batchFrequency;
  }

  public submitJob(job: Job): Promise<JobResult> {}

  public shutdown(): Promise<void> {}
}