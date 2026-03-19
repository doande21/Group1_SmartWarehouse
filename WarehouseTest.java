public class WarehouseTest {
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
}
