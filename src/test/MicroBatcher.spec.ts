import {MicroBatcher} from "../MicroBatcher";

jest.useFakeTimers();

describe("MicroBatcher", () => {
  const batchProcessor = jest.fn(async <T>(jobs: (() => T)[]): Promise<T[]> => {
    return jobs.map(job => job());
  })

  beforeEach(() => {
    batchProcessor.mockClear();
  });

  describe("submitJob", () => {
    describe("GIVEN one job and batch size of two", () => {
      it("SHOULD only run batch function on frequency interval and resolve job", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);
        const job = () => "Job 1 result";

        const result = microBatcher.submitJob(job);

        jest.advanceTimersByTime(1000);

        expect(await result).toStrictEqual("Job 1 result");
        expect(batchProcessor).toHaveBeenCalledTimes(1)
      })
    })

    describe("GIVEN two jobs and batch size of two", () => {
      it("SHOULD run batch function instantly and resolve both jobs", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);
        const job1 = () => "Job 1 result";
        const job2 = () => "Job 2 result";

        const result1 = microBatcher.submitJob(job1);
        const result2 = microBatcher.submitJob(job2);

        expect(await result1).toStrictEqual("Job 1 result");
        expect(await result2).toStrictEqual("Job 2 result");
        expect(batchProcessor).toHaveBeenCalledTimes(1);

        // Fast-forward time to ensure the interval does not trigger another call
        jest.advanceTimersByTime(1000);
        expect(batchProcessor).toHaveBeenCalledTimes(1);
      })
    })

    describe("GIVEN three jobs and batch size of two", () => {
      it("SHOULD run batch function instantly and then run again on frequency interval and resolve all jobs", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);
        const job1 = () => "Job 1 result";
        const job2 = () => "Job 2 result";
        const job3 = () => "Job 3 result";

        const result1 = microBatcher.submitJob(job1);
        const result2 = microBatcher.submitJob(job2);
        const result3 = microBatcher.submitJob(job3);

        expect(await result1).toStrictEqual("Job 1 result");
        expect(await result2).toStrictEqual("Job 2 result");

        // Fast-forward time to ensure the interval does not trigger another call
        jest.advanceTimersByTime(1000);

        expect(await result3).toStrictEqual("Job 3 result");
        expect(batchProcessor).toHaveBeenCalledTimes(2);
      })
    })

    describe("GIVEN two submitted jobs and a batch size of one", () => {
      it("SHOULD run batch function twice and resolve all jobs", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 1, 1000);
        const job1 = () => "Job 1 result";
        const job2 = () => "Job 2 result";

        const result1 = microBatcher.submitJob(job1);
        const result2 = microBatcher.submitJob(job2);

        expect(await result1).toStrictEqual("Job 1 result");
        expect(await result2).toStrictEqual("Job 2 result");
        expect(batchProcessor).toHaveBeenCalledTimes(2);
      })
    })
  })

  describe("shutdown", () => {
    describe("GIVEN no jobs and shutdown triggered", () => {
      it("SHOULD return an empty array", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);

        const result = await microBatcher.shutdown();

        expect(result).toStrictEqual([]);
        expect(batchProcessor).not.toHaveBeenCalled();
      })
    })

    describe("GIVEN one job and shutdown triggered", () => {
      it("SHOULD return an array with the job result", async () => {
        const microBatcher = new MicroBatcher(batchProcessor, 2, 1000);
        const job = () => "Job 1 result";

        microBatcher.submitJob(job);

        expect(await microBatcher.shutdown()).toStrictEqual(["Job 1 result"]);
        expect(batchProcessor).toHaveBeenCalledTimes(1);
      })
    })
  })
})