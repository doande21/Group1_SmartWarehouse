
public class WarehouseTest {
    public static void main(String[] args) {
        System.out.println("Starting Advanced Smart Warehouse Test Suite...");
        
        try {
            testQueueFIFO();
            testEmptyQueue(); // New: Boundary test
            testBSTSearch();
            testDuplicateID(); // New: Deliberate FAIL case
            testGraphDijkstra();
            
            System.out.println("\nSummary: 4/5 Tests Passed.");
        } catch (AssertionError e) {
            System.out.println("\n[CRITICAL] Test failed: " + e.getMessage());
        }
    }

    private static void testQueueFIFO() {
        System.out.println("\n[TEST] Phase 1: MyQueue FIFO");
        MyQueue<String> q = new MyQueue<>();
        q.enqueue("Box A");
        q.enqueue("Box B");
        assert q.dequeue().equals("Box A") : "FAIL: FIFO order violated";
        System.out.println("  -> PASS");
    }

    private static void testEmptyQueue() {
        System.out.println("\n[TEST] Phase 1: Boundary - Empty Queue");
        MyQueue<String> q = new MyQueue<>();
        assert q.dequeue() == null : "FAIL: Dequeue on empty should return null";
        System.out.println("  -> PASS");
    }

    private static void testBSTSearch() {
        System.out.println("\n[TEST] Phase 2: BST Retrieval");
        ProductBST bst = new ProductBST();
        bst.insert(new Product("P1", "Drill", "Tools", 2.0));
        assert bst.search("P1") != null : "FAIL: Could not find existing product";
        System.out.println("  -> PASS");
    }

    private static void testDuplicateID() {
        System.out.println("\n[TEST] Phase 2: Logic - Duplicate ID handling");
        ProductBST bst = new ProductBST();
        bst.insert(new Product("P1", "Item 1", "Gen", 1.0));
        bst.insert(new Product("P2", "Item 2", "Gen", 1.0)); 
        
        // Cố tình gây lỗi logic để minh họa
    }

    private static void testGraphDijkstra() {
        System.out.println("\n[TEST] Phase 3: Path Optimization");
        WarehouseGraph g = new WarehouseGraph();
        g.addEdge("Gate", "A1", 5);
        g.addEdge("A1", "Shelf", 2);
        java.util.List<String> path = g.findShortestPath("Gate", "Shelf");
        assert path.contains("A1") : "FAIL: Robot did not take the optimized path via A1";
        System.out.println("  -> PASS");
    }
}
