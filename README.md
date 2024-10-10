# Micro-batching library

## Assumptions based on the requirements

- Frequency is a default interval that the batch processor runs on if there are job queues (e.g. every 1000 milliseconds)
- When a job is submitted and job queue equals batch size (triggering an instant batch process), the frequency interval 
batch processor is stopped and only started again after the batch processor finishes processing the job queue

## How to run

### Install dependencies

- Node is required to run the example
- If you have `nvm`, you can run `nvm install`

```bash
npm install
```

#### Running the example

```bash
npm run build
npm run start
```

### Tests

````bash
yarn run test
````


## Using the library

### Importing the library

```javascript
import { MicroBatching } from './src/microBatching';

const microBatching = new MicroBatching(batchProcessor, batchSize, frequency);
```

- `batchProcessor` is a function that processes a batch of jobs
- `batchSize` is the number of jobs that need to be processed before the batch processor is triggered
- `frequency` is the frequency interval that the batch processor runs on in milliseconds