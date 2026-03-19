import java.util.*;

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

    // Dijkstra Algorithm
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

    private static class Node {
        String name;
        int distance;
        Node(String name, int distance) {
            this.name = name;
            this.distance = distance;
        }
    }

    // File I/O Simulation: Load from String
    public void loadMapConfig(String config) {
        // Format: "node1,node2,weight" per line
        String[] lines = config.split("\n");
        for (String line : lines) {
            String[] parts = line.split(",");
            if (parts.length == 3) {
                addEdge(parts[0], parts[1], Integer.parseInt(parts[2]));
            }
        }
    }
}
