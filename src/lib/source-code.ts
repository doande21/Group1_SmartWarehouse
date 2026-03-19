/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SOURCE_CODE: Record<string, string> = {
  'Product.java': `public class Product {
    private String id;
    private String name;
    private String category;

    public Product(String id, String name, String category) {
        this.id = id;
        this.name = name;
        this.category = category;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
}`,
  'MyQueue.java': `import java.util.LinkedList;

public class MyQueue<T> {
    private LinkedList<T> list = new LinkedList<>();

    public void enqueue(T item) {
        list.addLast(item);
    }

    public T dequeue() {
        if (list.isEmpty()) return null;
        return list.removeFirst();
    }

    public boolean isEmpty() {
        return list.isEmpty();
    }

    public int size() {
        return list.size();
    }
}`,
  'ProductBST.java': `public class ProductBST {
    private class BSTNode {
        Product product;
        BSTNode left, right;
        BSTNode(Product p) { this.product = p; }
    }

    private BSTNode root;

    public void insert(Product p) {
        root = insertRec(root, p);
    }

    private BSTNode insertRec(BSTNode root, Product p) {
        if (root == null) return new BSTNode(p);
        
        if (p.getId().compareTo(root.product.getId()) < 0)
            root.left = insertRec(root.left, p);
        else if (p.getId().compareTo(root.product.getId()) > 0)
            root.right = insertRec(root.right, p);
            
        return root;
    }

    public Product search(String id) {
        return searchRec(root, id);
    }

    private Product searchRec(BSTNode root, String id) {
        if (root == null || root.product.getId().equals(id))
            return root == null ? null : root.product;
            
        if (id.compareTo(root.product.getId()) < 0)
            return searchRec(root.left, id);
            
        return searchRec(root.right, id);
    }

    public void delete(String id) {
        root = deleteRec(root, id);
    }

    private BSTNode deleteRec(BSTNode root, String id) {
        if (root == null) return root;

        if (id.compareTo(root.product.getId()) < 0)
            root.left = deleteRec(root.left, id);
        else if (id.compareTo(root.product.getId()) > 0)
            root.right = deleteRec(root.right, id);
        else {
            if (root.left == null) return root.right;
            else if (root.right == null) return root.left;

            root.product = minValue(root.right);
            root.right = deleteRec(root.right, root.product.getId());
        }
        return root;
    }

    private Product minValue(BSTNode root) {
        Product minv = root.product;
        while (root.left != null) {
            minv = root.left.product;
            root = root.left;
        }
        return minv;
    }
}`,
  'BSTTest.java': `public class BSTTest {
    public static void main(String[] args) {
        ProductBST tree = new ProductBST();
        
        System.out.println("--- Starting BST Unit Tests ---");
        
        // Test 1: Insertion
        Product p1 = new Product("M", "Middle", "Test");
        Product p2 = new Product("A", "Alpha", "Test");
        Product p3 = new Product("Z", "Zulu", "Test");
        
        tree.insert(p1);
        tree.insert(p2);
        tree.insert(p3);
        
        // Test 2: Search (Should Pass)
        if (tree.search("A") != null) {
            System.out.println("[PASS] Test 2: Found product 'A'");
        } else {
            System.out.println("[FAIL] Test 2: Could not find product 'A'");
        }
        
        // Test 3: Search Non-existent (Should Pass)
        if (tree.search("B") == null) {
            System.out.println("[PASS] Test 3: Correctly returned null for 'B'");
        } else {
            System.out.println("[FAIL] Test 3: Incorrectly found non-existent 'B'");
        }

        // Test 4: Delete (Should Pass)
        tree.delete("A");
        if (tree.search("A") == null) {
            System.out.println("[PASS] Test 4: Successfully deleted 'A'");
        } else {
            System.out.println("[FAIL] Test 4: 'A' still exists after delete");
        }
        
        System.out.println("--- Tests Completed ---");
    }
}`,
  'WarehouseGraph.java': `import java.util.*;

public class WarehouseGraph {
    private Map<String, List<Edge>> adjList = new HashMap<>();

    public static class Edge {
        String to;
        int weight;
        Edge(String to, int weight) {
            this.to = to;
            this.weight = weight;
        }
    }

    public void addEdge(String u, String v, int w) {
        adjList.computeIfAbsent(u, k -> new ArrayList<>()).add(new Edge(v, w));
        adjList.computeIfAbsent(v, k -> new ArrayList<>()).add(new Edge(u, w));
    }

    public List<String> findShortestPath(String start, String end) {
        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.distance));

        for (String node : adjList.keySet()) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(start, 0);
        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node current = pq.poll();
            if (current.name.equals(end)) break;

            for (Edge edge : adjList.getOrDefault(current.name, new ArrayList<>())) {
                int newDist = distances.get(current.name) + edge.weight;
                if (newDist < distances.get(edge.to)) {
                    distances.put(edge.to, newDist);
                    previous.put(edge.to, current.name);
                    pq.add(new Node(edge.to, newDist));
                }
            }
        }

        List<String> path = new LinkedList<>();
        for (String at = end; at != null; at = previous.get(at)) {
            path.add(0, at);
        }
        return path.get(0).equals(start) ? path : new ArrayList<>();
    }

    public void loadMapConfig(String config) {
        String[] lines = config.split("\\n");
        for (String line : lines) {
            String[] parts = line.split(",");
            if (parts.length == 3) {
                addEdge(parts[0], parts[1], Integer.parseInt(parts[2]));
            }
        }
    }
}`,
  'GraphTest.java': `public class GraphTest {
    public static void main(String[] args) {
        WarehouseGraph graph = new WarehouseGraph();
        
        System.out.println("--- Starting Graph Unit Tests ---");
        
        // Setup simple grid
        graph.addEdge("0-0", "0-1", 1);
        graph.addEdge("0-1", "0-2", 1);
        graph.addEdge("0-0", "1-0", 1);
        
        // Test 1: Shortest Path
        List<String> path = graph.findShortestPath("0-0", "0-2");
        if (path.size() == 3 && path.contains("0-1")) {
            System.out.println("[PASS] Test 1: Shortest path found correctly");
        } else {
            System.out.println("[FAIL] Test 1: Path calculation error");
        }
        
        // Test 2: Unreachable Node
        List<String> noPath = graph.findShortestPath("0-0", "9-9");
        if (noPath.isEmpty()) {
            System.out.println("[PASS] Test 2: Correctly identified unreachable node");
        } else {
            System.out.println("[FAIL] Test 2: Found path to non-existent node");
        }
        
        System.out.println("--- Graph Tests Completed ---");
    }
}`,
  'PerformanceBenchmark.java': `import java.util.*;

public class PerformanceBenchmark {
    public static void main(String[] args) {
        int SIZE = 10000;
        List<Product> list = new ArrayList<>();
        ProductBST bst = new ProductBST();
        
        // Generate 10,000 items
        for (int i = 0; i < SIZE; i++) {
            Product p = new Product("ID-" + i, "Product " + i, "Test");
            list.add(p);
            bst.insert(p);
        }
        
        String targetId = "ID-9999";
        
        // Benchmark List (Linear Search)
        long startList = System.nanoTime();
        Product foundList = null;
        for (Product p : list) {
            if (p.id.equals(targetId)) {
                foundList = p;
                break;
            }
        }
        long endList = System.nanoTime();
        
        // Benchmark BST (Logarithmic Search)
        long startBST = System.nanoTime();
        Product foundBST = bst.search(targetId);
        long endBST = System.nanoTime();
        
        System.out.println("Benchmark Results for " + SIZE + " items:");
        System.out.println("List Search Time: " + (endList - startList) / 1000000.0 + " ms");
        System.out.println("BST Search Time: " + (endBST - startBST) / 1000000.0 + " ms");
        System.out.println("Efficiency Gain: " + (double)(endList - startList) / (endBST - startBST) + "x");
    }
}`,
  'WarehouseTest.java': `public class WarehouseTest {
    public static void main(String[] args) {
        System.out.println("Initializing Warehouse Simulator...");
        
        MyQueue<Product> conveyor = new MyQueue<>();
        ProductBST inventory = new ProductBST();
        
        Product p1 = new Product("PKG-A1", "Sensor Unit", "Electronics");
        conveyor.enqueue(p1);
        
        System.out.println("Added " + p1.getId() + " to conveyor.");
        
        Product dispatched = conveyor.dequeue();
        if (dispatched != null) {
            inventory.insert(dispatched);
            System.out.println("Dispatched and stored " + dispatched.getId());
        }
    }
}`
};
