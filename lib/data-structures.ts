
import { Product } from '../types';

export class QueueNode<T> {
  data: T;
  next: QueueNode<T> | null = null;
  constructor(data: T) { this.data = data; }
}

export class CustomQueue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private _size: number = 0;

  // Thêm vào cuối (Enqueue)
  enqueue(data: T) {
    const newNode = new QueueNode(data);
    if (this.tail) {
      this.tail.next = newNode;
      this.tail = newNode;
    } else {
      this.head = this.tail = newNode;
    }
    this._size++;
  }

  // Lấy ra từ đầu (Dequeue)
  dequeue(): T | null {
    if (!this.head) return null;
    const data = this.head.data;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this._size--;
    return data;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  get size() { return this._size; }
}
