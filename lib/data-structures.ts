
import { Product, BSTNode, GraphPoint, Edge } from '../types';

// --- Phase 1: Custom Linked List based Queue ---
export class QueueNode<T> {
  data: T;
  next: QueueNode<T> | null = null;
  constructor(data: T) { this.data = data; }
}

export class CustomQueue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private _size: number = 0;

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

// --- Phase 2: Binary Search Tree (BST) ---
export class CustomBST {
  root: BSTNode | null = null;

  insert(product: Product) {
    this.root = this._insert(this.root, product);
  }

  private _insert(node: BSTNode | null, product: Product): BSTNode {
    if (!node) return { product, left: null, right: null };
    if (product.id < node.product.id) {
      node.left = this._insert(node.left, product);
    } else if (product.id > node.product.id) {
      node.right = this._insert(node.right, product);
    }
    return node;
  }

  find(id: string): Product | null {
    return this._find(this.root, id);
  }

  private _find(node: BSTNode | null, id: string): Product | null {
    if (!node) return null;
    if (id === node.product.id) return node.product;
    return id < node.product.id 
      ? this._find(node.left, id) 
      : this._find(node.right, id);
  }

  inOrderTraversal(): Product[] {
    const result: Product[] = [];
    this._inOrder(this.root, result);
    return result;
  }

  private _inOrder(node: BSTNode | null, result: Product[]) {
    if (!node) return;
    this._inOrder(node.left, result);
    result.push(node.product);
    this._inOrder(node.right, result);
  }
}

// --- Phase 3: Graph with Dijkstra ---
export class WarehouseGraph {
  adjacencyList: Map<string, Edge[]> = new Map();
  points: Map<string, GraphPoint> = new Map();

  addPoint(point: GraphPoint) {
    this.points.set(point.id, point);
    if (!this.adjacencyList.has(point.id)) {
      this.adjacencyList.set(point.id, []);
    }
  }

  addEdge(u: string, v: string, weight: number) {
    this.adjacencyList.get(u)?.push({ to: v, weight });
    this.adjacencyList.get(v)?.push({ to: u, weight });
  }

  dijkstra(startId: string, endId: string): string[] {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const nodes = Array.from(this.points.keys());

    nodes.forEach(node => {
      distances.set(node, Infinity);
      previous.set(node, null);
    });

    distances.set(startId, 0);
    const unvisited = new Set(nodes);

    while (unvisited.size > 0) {
      let closestNode: string | null = null;
      for (const node of unvisited) {
        if (closestNode === null || distances.get(node)! < distances.get(closestNode)!) {
          closestNode = node;
        }
      }

      if (closestNode === null || distances.get(closestNode) === Infinity) break;
      if (closestNode === endId) break;

      unvisited.delete(closestNode);

      const neighbors = this.adjacencyList.get(closestNode) || [];
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const alt = distances.get(closestNode)! + edge.weight;
          if (alt < distances.get(edge.to)!) {
            distances.set(edge.to, alt);
            previous.set(edge.to, closestNode);
          }
        }
      }
    }

    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    return path[0] === startId ? path : [];
  }
}
