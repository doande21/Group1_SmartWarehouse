public class ProductBST {
    private class BSTNode {
        Product product;
        BSTNode left, right;
        BSTNode(Product p) { this.product = p; }

        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
        }
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
}
