"""
Graph algorithms for transit route optimization.
Implements Dijkstra and A* pathfinding.
"""
import heapq
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass
import math
from app.utils.geolocation import haversine_distance

@dataclass
class Node:
    """Represents a transit node (stop or station)."""
    id: str
    name: str
    lat: float
    lon: float
    node_type: str  # "bus_stop", "metro_station", "walking_start", "walking_end"

@dataclass
class Edge:
    """Represents a transit edge (connection between nodes)."""
    from_node: str
    to_node: str
    distance_km: float
    duration_minutes: int
    mode: str  # "bus", "metro", "walk", "transfer"
    metadata: Dict = None

class TransitGraph:
    """Graph representing multimodal transit network."""
    
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: Dict[str, List[Edge]] = {}
    
    def add_node(self, node: Node):
        """Add a node to the graph."""
        self.nodes[node.id] = node
        if node.id not in self.edges:
            self.edges[node.id] = []
    
    def add_edge(self, edge: Edge):
        """Add an edge to the graph."""
        if edge.from_node not in self.edges:
            self.edges[edge.from_node] = []
        self.edges[edge.from_node].append(edge)
    
    def get_neighbors(self, node_id: str) -> List[Edge]:
        """Get all edges from a node."""
        return self.edges.get(node_id, [])

@dataclass
class PathResult:
    """Result of pathfinding."""
    path: List[str]  # List of node IDs
    distance_km: float
    duration_minutes: int
    edges: List[Edge]

class DijkstraPathfinder:
    """Dijkstra algorithm implementation for shortest path."""
    
    def __init__(self, graph: TransitGraph):
        self.graph = graph
    
    def find_shortest_path(
        self,
        start_id: str,
        end_id: str,
        mode_filter: Optional[List[str]] = None
    ) -> Optional[PathResult]:
        """Find shortest path using Dijkstra algorithm."""
        
        if start_id not in self.graph.nodes or end_id not in self.graph.nodes:
            return None
        
        # Initialize distances and previous nodes
        distances = {node_id: float('inf') for node_id in self.graph.nodes}
        distances[start_id] = 0
        previous = {node_id: None for node_id in self.graph.nodes}
        edges_used = {node_id: None for node_id in self.graph.nodes}
        
        # Priority queue: (distance, node_id)
        pq = [(0, start_id)]
        visited = set()
        
        while pq:
            current_dist, current_node = heapq.heappop(pq)
            
            if current_node in visited:
                continue
            
            visited.add(current_node)
            
            if current_node == end_id:
                return self._reconstruct_path(
                    start_id, end_id, distances, previous, edges_used
                )
            
            # Check all neighbors
            for edge in self.graph.get_neighbors(current_node):
                if mode_filter and edge.mode not in mode_filter:
                    continue
                
                neighbor = edge.to_node
                if neighbor in visited:
                    continue
                
                new_distance = distances[current_node] + edge.duration_minutes
                
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    previous[neighbor] = current_node
                    edges_used[neighbor] = edge
                    heapq.heappush(pq, (new_distance, neighbor))
        
        return None
    
    def _reconstruct_path(
        self,
        start_id: str,
        end_id: str,
        distances: Dict,
        previous: Dict,
        edges_used: Dict
    ) -> Optional[PathResult]:
        """Reconstruct path from Dijkstra results."""
        
        path = []
        current = end_id
        edges = []
        total_distance = 0
        
        while current is not None:
            path.append(current)
            if edges_used[current] is not None:
                edges.append(edges_used[current])
                total_distance += edges_used[current].distance_km
            current = previous[current]
        
        path.reverse()
        edges.reverse()
        
        if path[0] != start_id:
            return None
        
        return PathResult(
            path=path,
            distance_km=total_distance,
            duration_minutes=int(distances[end_id]),
            edges=edges
        )

class AStarPathfinder:
    """A* algorithm implementation with heuristic."""
    
    def __init__(self, graph: TransitGraph):
        self.graph = graph
    
    def _heuristic(self, node_id: str, goal_id: str) -> float:
        """Calculate heuristic distance between nodes."""
        if node_id not in self.graph.nodes or goal_id not in self.graph.nodes:
            return 0
        
        node = self.graph.nodes[node_id]
        goal = self.graph.nodes[goal_id]
        
        distance = haversine_distance(
            node.lat, node.lon,
            goal.lat, goal.lon
        )
        
        # Approximate time assuming average speed of 20 km/h
        return (distance / 20) * 60  # minutes
    
    def find_optimal_path(
        self,
        start_id: str,
        end_id: str,
        mode_filter: Optional[List[str]] = None
    ) -> Optional[PathResult]:
        """Find optimal path using A* algorithm."""
        
        if start_id not in self.graph.nodes or end_id not in self.graph.nodes:
            return None
        
        open_set = [(0, start_id)]
        came_from = {}
        g_score = {node_id: float('inf') for node_id in self.graph.nodes}
        g_score[start_id] = 0
        edges_used = {}
        
        closed_set = set()
        
        while open_set:
            _, current = heapq.heappop(open_set)
            
            if current in closed_set:
                continue
            
            if current == end_id:
                return self._reconstruct_path_astar(
                    start_id, end_id, came_from, g_score, edges_used
                )
            
            closed_set.add(current)
            
            for edge in self.graph.get_neighbors(current):
                if mode_filter and edge.mode not in mode_filter:
                    continue
                
                neighbor = edge.to_node
                if neighbor in closed_set:
                    continue
                
                tentative_g = g_score[current] + edge.duration_minutes
                
                if tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    edges_used[neighbor] = edge
                    
                    f_score = tentative_g + self._heuristic(neighbor, end_id)
                    heapq.heappush(open_set, (f_score, neighbor))
        
        return None
    
    def _reconstruct_path_astar(
        self,
        start_id: str,
        end_id: str,
        came_from: Dict,
        g_score: Dict,
        edges_used: Dict
    ) -> Optional[PathResult]:
        """Reconstruct path from A* results."""
        
        path = [end_id]
        current = end_id
        edges = []
        
        while current in came_from:
            current = came_from[current]
            path.append(current)
            if current in edges_used:
                edges.append(edges_used[current])
        
        path.reverse()
        edges.reverse()
        
        if path[0] != start_id:
            return None
        
        total_distance = sum(e.distance_km for e in edges)
        
        return PathResult(
            path=path,
            distance_km=total_distance,
            duration_minutes=int(g_score[end_id]),
            edges=edges
        )
