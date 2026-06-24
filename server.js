const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const USER_ID = 'kashisharora_05092005';
const EMAIL_ID = 'kashish3853.beai23@chitkara.edu.in';
const COLLEGE_ROLL_NUMBER = '2310993853';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const EDGE_REGEX = /^[A-Z]->[A-Z]$/;

function findComponentCycle(nodes, childrenMap) {
  const state = new Map();

  function dfs(node) {
    state.set(node, 1);
    const children = childrenMap.get(node) || [];

    for (const child of children) {
      if (!nodes.has(child)) {
        continue;
      }
      const childState = state.get(child) || 0;
      if (childState === 1) {
        return true;
      }
      if (childState === 0 && dfs(child)) {
        return true;
      }
    }

    state.set(node, 2);
    return false;
  }

  for (const node of nodes) {
    if ((state.get(node) || 0) === 0 && dfs(node)) {
      return true;
    }
  }

  return false;
}

function buildTree(root, childrenMap) {
  function buildNode(node) {
    const nested = {};
    const children = childrenMap.get(node) || [];
    for (const child of children) {
      nested[child] = buildNode(child);
    }
    return nested;
  }

  return { [root]: buildNode(root) };
}

function computeDepth(root, childrenMap) {
  function depth(node) {
    const children = childrenMap.get(node) || [];
    if (children.length === 0) {
      return 1;
    }

    let best = 0;
    for (const child of children) {
      best = Math.max(best, depth(child));
    }
    return 1 + best;
  }

  return depth(root);
}

function processHierarchyData(entries) {
  const invalidEntries = [];
  const duplicateEdgeSet = new Set();
  const seenEdgeSet = new Set();

  const childToParent = new Map();
  const childrenMap = new Map();
  const indegree = new Map();
  const undirected = new Map();
  const nodeOrder = [];
  const nodeSeen = new Set();

  function ensureNode(node) {
    if (!nodeSeen.has(node)) {
      nodeSeen.add(node);
      nodeOrder.push(node);
    }
    if (!childrenMap.has(node)) {
      childrenMap.set(node, []);
    }
    if (!indegree.has(node)) {
      indegree.set(node, 0);
    }
    if (!undirected.has(node)) {
      undirected.set(node, new Set());
    }
  }

  for (const rawEntry of entries) {
    const normalized = typeof rawEntry === 'string' ? rawEntry.trim() : String(rawEntry);

    if (!EDGE_REGEX.test(normalized)) {
      invalidEntries.push(normalized);
      continue;
    }

    const [parent, child] = normalized.split('->');

    if (parent === child) {
      invalidEntries.push(normalized);
      continue;
    }

    if (seenEdgeSet.has(normalized)) {
      duplicateEdgeSet.add(normalized);
      continue;
    }
    seenEdgeSet.add(normalized);

    if (childToParent.has(child)) {
      continue;
    }

    childToParent.set(child, parent);

    ensureNode(parent);
    ensureNode(child);

    childrenMap.get(parent).push(child);
    indegree.set(child, (indegree.get(child) || 0) + 1);
    undirected.get(parent).add(child);
    undirected.get(child).add(parent);
  }

  const visited = new Set();
  const hierarchies = [];

  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = '';
  let largestTreeDepth = -1;

  for (const startNode of nodeOrder) {
    if (visited.has(startNode)) {
      continue;
    }

    const stack = [startNode];
    const componentNodes = new Set();

    while (stack.length > 0) {
      const node = stack.pop();
      if (visited.has(node)) {
        continue;
      }

      visited.add(node);
      componentNodes.add(node);

      for (const neighbor of undirected.get(node) || []) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    const roots = [];
    for (const node of componentNodes) {
      if ((indegree.get(node) || 0) === 0) {
        roots.push(node);
      }
    }
    roots.sort();

    const fallbackRoot = [...componentNodes].sort()[0];
    const root = roots[0] || fallbackRoot;

    const hasCycle = findComponentCycle(componentNodes, childrenMap);

    if (hasCycle) {
      totalCycles += 1;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      continue;
    }

    const tree = buildTree(root, childrenMap);
    const depth = computeDepth(root, childrenMap);

    totalTrees += 1;
    if (
      depth > largestTreeDepth ||
      (depth === largestTreeDepth && (largestTreeRoot === '' || root < largestTreeRoot))
    ) {
      largestTreeDepth = depth;
      largestTreeRoot = root;
    }

    hierarchies.push({
      root,
      tree,
      depth,
    });
  }

  return {
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: [...duplicateEdgeSet],
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

app.post('/bfhl', (req, res) => {
  const { data } = req.body || {};

  if (!Array.isArray(data)) {
    return res.status(400).json({
      error: "Invalid request body. Expected: { data: ['A->B', ...] }",
    });
  }

  const result = processHierarchyData(data);

  return res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    ...result,
  });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
