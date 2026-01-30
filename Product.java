
public class Product {
    private String id;
    private String name;
    private String category;
    private double weight;
    private long timestamp;

    public Product(String id, String name, String category, double weight) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.weight = weight;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getWeight() { return weight; }
    
    @Override
    public String toString() {
        return String.format("[%s] %s (%s) - %.2fkg", id, name, category, weight);
    }
}
