// Returns a Map of Nodes with distance values from the given source Node.
// Assumes all links are directional.
function findDistances(source, directional = true) {
  var diagram = source.diagram;
  // keep track of distances from the source node
  var distances = new go.Map(/*go.Node, "number"*/);
  // all nodes start with distance Infinity
  var nit = diagram.nodes;
  while (nit.next()) {
    var n = nit.value;
    distances.set(n, Infinity);
  }
  // the source node starts with distance 0
  distances.set(source, 0);
  // keep track of nodes for which we have set a non-Infinity distance,
  // but which we have not yet finished examining
  var seen = new go.Set(/*go.Node*/);
  seen.add(source);

  // keep track of nodes we have finished examining;
  // this avoids unnecessary traversals and helps keep the SEEN collection small
  var finished = new go.Set(/*go.Node*/);
  while (seen.count > 0) {
    // look at the unfinished node with the shortest distance so far
    var least = leastNode(seen, distances);
    var leastdist = distances.get(least);
    // by the end of this loop we will have finished examining this LEAST node
    seen.delete(least);
    finished.add(least);
    // look at all Links connected with this node
    var it = directional ? least.findLinksOutOf() : least.findLinksConnected();
    while (it.next()) {
      var link = it.value;
      var neighbor = link.getOtherNode(least);
      // skip nodes that we have finished
      if (finished.has(neighbor)) continue;
      var neighbordist = distances.get(neighbor);
      // assume "distance" along a link is unitary, but could be any non-negative number.
      var dist = leastdist + 1; //Math.sqrt(least.location.distanceSquaredPoint(neighbor.location));
      if (dist < neighbordist) {
        // if haven't seen that node before, add it to the SEEN collection
        if (neighbordist === Infinity) {
          seen.add(neighbor);
        }
        // record the new best distance so far to that node
        distances.set(neighbor, dist);
      }
    }
  }

  return distances;
}

// This helper function finds a Node in the given collection that has the smallest distance.
function leastNode(coll, distances) {
  var bestdist = Infinity;
  var bestnode = null;
  var it = coll.iterator;
  while (it.next()) {
    var n = it.value;
    var dist = distances.get(n);
    if (dist < bestdist) {
      bestdist = dist;
      bestnode = n;
    }
  }
  return bestnode;
}

// Find a path that is shortest from the BEGIN node to the END node.
// (There might be more than one, and there might be none.)
function findShortestPath(begin, end, directional = true) {
  // compute and remember the distance of each node from the BEGIN node
  let distances = findDistances(begin, directional);
  // now find a path from END to BEGIN, always choosing the adjacent Node with the lowest distance
  var path = new go.List();
  path.add(end);
  while (end !== null) {
    var next = directional
      ? leastNode(end.findNodesInto(), distances)
      : leastNode(end.findNodesConnected(), distances);
    if (next !== null) {
      if (distances.get(next) < distances.get(end)) {
        path.add(next); // making progress towards the beginning
      } else {
        next = null; // nothing better found -- stop looking
      }
    }
    end = next;
  }
  // reverse the list to start at the node closest to BEGIN that is on the path to END
  // NOTE: if there's no path from BEGIN to END, the first node won't be BEGIN!
  path.reverse();
  return path;
}

export default {
  findShortestPath,
};
