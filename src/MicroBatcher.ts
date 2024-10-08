type Job = () => any;
type JobResult = JobSuccess | JobFailure;
type JobSuccess = { status: 'success'; result: any };
type JobFailure = { status: 'failure'; error: Error };
type BatchProcessor = (jobs: Job[]) => Promise<JobResult[]>;

class MicroBatcher {
  private batchSize: number
  private batchFrequency: number
  private batchProcessor: BatchProcessor
  private jobQueue:  { job: Job; resolve: (result: JobResult) => void; reject: (error: Error) => void }[] = []
  private intervalId: number;


  constructor(
    processor: BatchProcessor,
    batchSize: number,
    batchFrequency: number
  ) {
    this.batchProcessor = processor;
    this.batchSize = batchSize;
    this.batchFrequency = batchFrequency;

    this.intervalId = setInterval(() => this.processBatch(), this.batchFrequency);
  }

  public async submitJob(job: Job): Promise<JobResult> {
    return new Promise((resolve, reject) => {
      this.jobQueue.push({ job, resolve, reject });

      if (this.jobQueue.length >= this.batchSize) {
        this.processBatch();
      }
    });

  }

  public async shutdown(): Promise<void> {
    clearInterval(this.intervalId);
    while (this.jobQueue.length > 0) {
      await this.processBatch();
    }
  }

  private async processBatch(): Promise<void> {
    if (this.jobQueue.length === 0) return;

    const jobsToProcess = this.jobQueue.splice(0, this.batchSize)
    try {
      const jobResults = await this.batchProcessor(jobsToProcess.map(({job}) => job))

      jobResults.forEach((jobResult, i) => {
        const {resolve, reject} = jobsToProcess[i]
        if (jobResult.status === 'success') {
          resolve(jobResult)
        } else {
          reject(jobResult.error)
        }
      })
    } catch (error) {
      jobsToProcess.forEach(({reject}) => reject(error))
    }
  }
}