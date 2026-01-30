
public class WarehouseTest {
    public static void main(String[] args) {
        System.out.println("Starting Warehouse Queue Test Suite...");
        
        try {
            testQueueFIFO();
            System.out.println("\nAll Tests Passed!");
        } catch (AssertionError e) {
            System.out.println("\n[CRITICAL] Test failed: " + e.getMessage());
        }
    }

    private static void testQueueFIFO() {
        System.out.println("\n[TEST] MyQueue FIFO Principle");
        MyQueue<String> q = new MyQueue<>();
        
        q.enqueue("Package_1");
        q.enqueue("Package_2");
        q.enqueue("Package_3");
        
        String first = q.dequeue();
        System.out.println("  -> Enqueued: 1, 2, 3. First Dequeued: " + first);
        
        if (!first.equals("Package_1")) {
            throw new AssertionError("FAIL: FIFO violated! First in must be first out.");
        }
        System.out.println("  -> PASS");
    }
}
