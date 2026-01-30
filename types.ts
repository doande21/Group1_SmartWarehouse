
export interface Product {
  id: string;
  name: string;
  category: string;
  weight: number;
  timestamp: number;
}

export interface Node<T> {
  data: T;
  next: Node<T> | null;
}

export interface BSTNode {
  product: Product;
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface GraphPoint {
  x: number;
  y: number;
  id: string;
  isObstacle: boolean;
}

export interface Edge {
  to: string;
  weight: number;
}

export interface BenchmarkResult {
  size: number;
  bstTime: number;
  listTime: number;
}
