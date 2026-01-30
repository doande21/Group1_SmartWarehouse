
import java.util.*;

public class WarehouseGraph {
    private class Edge {
        String target;
        int weight;
        Edge(String target, int weight) {
            this.target = target;
            this.weight = weight;
        }
    }

    private Map<String, List<Edge>> adjacencyList = new HashMap<>();

    public void addEdge(String source, String target, int weight) {
        adjacencyList.computeIfAbsent(source, k -> new ArrayList<>()).add(new Edge(target, weight));
        adjacencyList.computeIfAbsent(target, k -> new ArrayList<>()).add(new Edge(source, weight));
    }

    public List<String> findShortestPath(String start, String end) {
        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingInt(distances::get));

        for (String node : adjacencyList.keySet()) {
            distances.put(node, Integer.MAX_VALUE);
            previous.put(node, null);
        }

        distances.put(start, 0);
        pq.add(start);

        while (!pq.isEmpty()) {
            String current = pq.poll();
            if (current.equals(end)) break;

            for (Edge edge : adjacencyList.getOrDefault(current, new ArrayList<>())) {
                int newDist = distances.get(current) + edge.weight;
                if (newDist < distances.get(edge.target)) {
                    distances.put(edge.target, newDist);
                    previous.put(edge.target, current);
                    pq.add(edge.target);
                }
            }
        }

        List<String> path = new ArrayList<>();
        for (String at = end; at != null; at = previous.get(at)) {
            path.add(at);
        }
        Collections.reverse(path);
        return path;
    }
}
