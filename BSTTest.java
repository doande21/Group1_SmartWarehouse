public class BSTTest {
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
}
