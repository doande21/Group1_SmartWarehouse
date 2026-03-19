/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  timestamp: number;
}

export class Node<T> {
  value: T;
  next: Node<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class LinkedList<T> {
  head: Node<T> | null = null;
  tail: Node<T> | null = null;
  size: number = 0;

  addFirst(value: T) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.size++;
  }

  addLast(value: T) {
    const newNode = new Node(value);
    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  removeFirst(): T | null {
    if (!this.head) return null;
    const val = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return val;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

export class Stack<T> {
  private list = new LinkedList<T>();
  push(item: T) { this.list.addFirst(item); }
  pop(): T | null { return this.list.removeFirst(); }
  peek(): T | null { return this.list.head?.value || null; }
  get size() { return this.list.size; }
  toArray() { return this.list.toArray(); }
}

export class Queue<T> {
  private list = new LinkedList<T>();
  enqueue(item: T) { this.list.addLast(item); }
  dequeue(): T | null { return this.list.removeFirst(); }
  peek(): T | null { return this.list.head?.value || null; }
  get size() { return this.list.size; }
  toArray() { return this.list.toArray(); }
}

export class BSTNode {
  product: Product;
  left: BSTNode | null = null;
  right: BSTNode | null = null;

  constructor(product: Product) {
    this.product = product;
  }
}

export class BST {
  root: BSTNode | null = null;

  insert(product: Product) {
    const newNode = new BSTNode(product);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    this._insertNode(this.root, newNode);
  }

  private _insertNode(node: BSTNode, newNode: BSTNode) {
    if (newNode.product.id < node.product.id) {
      if (!node.left) node.left = newNode;
      else this._insertNode(node.left, newNode);
    } else {
      if (!node.right) node.right = newNode;
      else this._insertNode(node.right, newNode);
    }
  }

  inOrderTraversal(): Product[] {
    const result: Product[] = [];
    this._inOrder(this.root, result);
    return result;
  }

  private _inOrder(node: BSTNode | null, result: Product[]) {
    if (node) {
      this._inOrder(node.left, result);
      result.push(node.product);
      this._inOrder(node.right, result);
    }
  }

  search(id: string): Product | null {
    // return this._searchNode(this.root, id);
    return null;
  }

  private _searchNode(node: BSTNode | null, id: string): Product | null {
    if (!node) return null;
    if (id === node.product.id) return node.product;
    return id < node.product.id 
      ? this._searchNode(node.left, id) 
      : this._searchNode(node.right, id);
  }
}

export interface Edge {
  to: string;
  weight: number;
}

export class Graph {
  adjacencyList: Map<string, Edge[]> = new Map();

  addNode(node: string) {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
    }
  }

  addEdge(from: string, to: string, weight: number) {
    this.addNode(from);
    this.addNode(to);
    this.adjacencyList.get(from)!.push({ to, weight });
    this.adjacencyList.get(to)!.push({ to: from, weight }); // Undirected for warehouse grid
  }

  dijkstra(startNode: string, endNode: string): string[] {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const nodes = new Set<string>();

    for (let node of this.adjacencyList.keys()) {
      distances[node] = node === startNode ? 0 : Infinity;
      previous[node] = null;
      nodes.add(node);
    }

    while (nodes.size > 0) {
      let closestNode = Array.from(nodes).reduce((minNode, node) => 
        distances[node] < distances[minNode] ? node : minNode
      );

      if (distances[closestNode] === Infinity || closestNode === endNode) break;

      nodes.delete(closestNode);

      for (let neighbor of this.adjacencyList.get(closestNode)!) {
        let alt = distances[closestNode] + neighbor.weight;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          previous[neighbor.to] = closestNode;
        }
      }
    }

    const path: string[] = [];
    let current: string | null = endNode;
    while (current) {
      path.unshift(current);
      current = previous[current];
    }
    return path[0] === startNode ? path : [];
  }
}
