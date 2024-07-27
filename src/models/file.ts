import { v4 as uuidv4 } from 'uuid';
import { type ChunkedBuffer } from '@/workers/filesplit';
import FileSplitWorker from '@/workers/filesplit.ts?worker';
export class MyFile {
  id: string;
  file: File;
  splitSize: number;
  count: number;
  chunks: ChunkedBuffer[];
  constructor(file: File, splitSize = 1024 * 1024) {
    this.id = uuidv4();
    this.file = file;
    this.splitSize = splitSize;
    this.count = Math.ceil(file.size / splitSize);
    this.chunks = [];
  }
  async split(size = this.splitSize) {
    const worker = new FileSplitWorker();
    worker.postMessage({ source: 'file-split-worker', id: this.id, file: this.file, size });
    await new Promise((r) => {
      worker.addEventListener('message', (e) => {
        const chunk = e.data as ChunkedBuffer;
        if (chunk.id !== this.id) return;
        this.chunks.push(chunk);
        if (this.count === this.chunks.length) {
          r(true);
        }
      });
    });
    worker.terminate();
  }
}
