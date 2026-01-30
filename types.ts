
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
