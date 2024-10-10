import { MicroBatcher } from "./MicroBatcher";

const batchProcessor = async (jobs: (() => any)[]): Promise<any[]> => {
  return jobs.map(job => job());
};

const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);

const job1 = () =>'Job 1 result';
const job2 = () => 'Job 2 result';
const job3 = () => 'Job 3 result';

const runDemo = async () => {
  try {
    const result1 = microBatcher.submitJob(job1) ;
    const result2 = microBatcher.submitJob(job2);
    const result3 = microBatcher.submitJob(job3);
    console.log([await result1, await result2, await result3]);
  } catch (error) {
    console.error(error);
  } finally {
    await microBatcher.shutdown();
  }
};

runDemo();