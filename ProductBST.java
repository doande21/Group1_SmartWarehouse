
public class ProductBST {
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
        
        // So sánh mã sản phẩm để sắp xếp
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

    // In danh sách theo thứ tự mã sản phẩm (LNR)
    public void printInOrder() {
        inOrderRec(root);
    }

    private void inOrderRec(BSTNode root) {
        if (root != null) {
            inOrderRec(root.left);
            System.out.println(root.product);
            inOrderRec(root.right);
        }
    }
}
