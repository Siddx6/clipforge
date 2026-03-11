const { Queue, Worker, QueueEvents } = require('bullmq');

const connection = {
  host: 'normal-glowworm-12435.upstash.io',
  port: 6379,
  password: 'ATCTAAIncDI4MzA2YTk0NWUwMjg0OTA1Yjk0MWQxZmQzNDkyNzM1YnAyMTI0MzU',
  tls: {}
};

const videoQueue = new Queue('video-generation', { connection });
const videoQueueEvents = new QueueEvents('video-generation', { connection });

module.exports = { videoQueue, videoQueueEvents, connection };