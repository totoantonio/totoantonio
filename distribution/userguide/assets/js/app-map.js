// Live diagrams on How It All Connects (owner, 2026-10-12). Bubbles spring out when scrolled into view; drag one and the
// connected ones follow; let go and it snaps home like a rubber band; click opens its page (if it has one).
// Data = the text in .app-map-data, two kinds:
//   tree (default): an outline, two spaces per level, "Name | link"
//   flow (data-kind="flow"): "# Group" starts a column, then one name per line; "A -> B" lines make arrows
//   steps (data-kind="steps"): "A -> B" or dotted "A ..> B", optional " : label"; drawn top to bottom in order
(function () {
  var D3 = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js";

  function parseTree(text) {
    var nodes = [], links = [], stack = [];
    text.split("\n").forEach(function (line) {
      if (!line.trim()) return;
      var depth = line.match(/^ */)[0].length / 2, parts = line.trim().split(" | ");
      var n = { id: nodes.length, name: parts[0], url: parts[1], depth: depth, level: Math.min(depth, 2) };
      nodes.push(n);
      stack[depth] = n;
      if (depth > 0) links.push({ source: stack[depth - 1].id, target: n.id });
    });
    return { nodes: nodes, links: links, groups: [] };
  }

  function parseFlow(text) {
    var nodes = [], links = [], groups = [], byName = {};
    text.split("\n").forEach(function (line) {
      line = line.trim();
      if (!line) return;
      if (line.indexOf("# ") === 0) { groups.push({ name: line.slice(2), members: [] }); return; }
      if (line.indexOf(" -> ") > 0) {
        var ab = line.split(" -> ");
        links.push({ source: byName[ab[0]].id, target: byName[ab[1]].id });
        return;
      }
      var g = groups[groups.length - 1], n = { id: nodes.length, name: line, level: 2 };
      nodes.push(n); g.members.push(n); byName[line] = n;
    });
    return { nodes: nodes, links: links, groups: groups };
  }

  function parseSteps(text) {
    var nodes = [], links = [], byName = {};
    function get(name) { return byName[name] || (byName[name] = nodes[nodes.push({ id: nodes.length, name: name, level: 2, rank: 0 }) - 1]); }
    text.split("\n").forEach(function (line) {
      var m = line.trim().match(/^(.+?) (->|\.\.>) (.+?)(?: : (.+))?$/);
      if (m) links.push({ source: get(m[1]).id, target: get(m[3]).id, dotted: m[2] === "..>", label: m[4] });
    });
    // rank = row: one below the step it comes from. An arrow back to an earlier step (it leads back to where it started)
    // doesn't count, e.g. "Return for changes" (of a two-way pair, the one pointing to the earlier-listed step).
    function reaches(from, to, seen) {
      if (from === to) return true;
      seen = seen || {}; seen[from] = true;
      return links.some(function (l) { return l.source === from && !seen[l.target] && reaches(l.target, to, seen); });
    }
    links.forEach(function (l) { l.back = l.target < l.source && reaches(l.target, l.source); });
    nodes.forEach(function () { links.forEach(function (l) { if (!l.back) nodes[l.target].rank = Math.max(nodes[l.target].rank, nodes[l.source].rank + 1); }); });
    return { nodes: nodes, links: links, groups: [] };
  }

  // Where each bubble lives when nobody is touching it
  function homesTree(data, W, H) {
    var root = data.nodes[0], chapters = data.nodes.filter(function (d) { return d.depth === 1; });
    var step = 2 * Math.PI / chapters.length;
    root.tx = W / 2; root.ty = H / 2;
    chapters.forEach(function (c, i) {
      var a = i * step - Math.PI / 2, kids = data.links.filter(function (l) { return l.source === c.id; });
      c.tx = W / 2 + Math.cos(a) * W * 0.22; c.ty = H / 2 + Math.sin(a) * H * 0.24;
      kids.forEach(function (l, j) {
        var k = data.nodes[l.target], b = a + (j - (kids.length - 1) / 2) * step * 0.8 / Math.max(1, kids.length - 1);
        k.tx = W / 2 + Math.cos(b) * W * 0.38; k.ty = H / 2 + Math.sin(b) * H * 0.40;
      });
    });
  }

  // Phone (portrait): centre on top, then each chapter with its pages in rows under it. Returns the height it needs.
  function homesTreeTall(data, W) {
    var root = data.nodes[0], y = 24;
    root.tx = W / 2; root.ty = y + root.hh; y += 2 * root.hh + 36;
    data.nodes.filter(function (d) { return d.depth === 1; }).forEach(function (c) {
      c.tx = W / 2; c.ty = y + c.hh; y += 2 * c.hh + 14;
      var row = [], rowW = 0;
      function flush() {
        var x = (W - rowW + 8) / 2;
        row.forEach(function (k) { k.tx = x + k.hw; k.ty = y + 14; x += 2 * k.hw + 8; });
        y += 36; row = []; rowW = 0;
      }
      data.links.filter(function (l) { return l.source === c.id; }).forEach(function (l) {
        var k = data.nodes[l.target], w = 2 * k.hw + 8;
        if (row.length && rowW + w > W - 16) flush();
        row.push(k); rowW += w;
      });
      if (row.length) flush();
      y += 22;
    });
    return y;
  }

  var ROW = 44, TOP = 52;
  function homesFlow(data, W, H) { // side by side columns, centred vertically
    data.groups.forEach(function (g, gi) {
      var start = (H - g.members.length * ROW - TOP) / 2 + TOP + ROW / 2 - 6;
      g.x = W * (gi + 0.5) / data.groups.length; g.y = start - ROW / 2 - 14;
      g.members.forEach(function (n, i) { n.tx = g.x; n.ty = start + i * ROW; });
    });
  }

  var STEP = 58;
  function homesSteps(data, W) {
    var rows = {};
    data.nodes.forEach(function (n) { (rows[n.rank] = rows[n.rank] || []).push(n); });
    Object.keys(rows).forEach(function (r) {
      var row = rows[r], gap = Math.min(250, (W - 60) / row.length);
      row.forEach(function (n, i) { n.tx = W / 2 + (i - (row.length - 1) / 2) * gap; n.ty = 36 + r * STEP; });
    });
  }

  function heightFor(kind, data, W) {
    if (kind === "steps") return 72 + Math.max.apply(null, data.nodes.map(function (n) { return n.rank; })) * STEP;
    if (kind === "flow") return TOP + Math.max.apply(null, data.groups.map(function (g) { return g.members.length; })) * ROW + 28;
    return Math.max(420, Math.min(640, W * 0.62));
  }

  function draw(box) {
    var d3 = window.d3, kind = box.dataset.kind || "tree";
    var data = ({ flow: parseFlow, steps: parseSteps }[kind] || parseTree)(box.querySelector(".app-map-data").textContent);
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Drawn at least this wide; anything narrower shrinks to fit (pinch to zoom).
    // Phones (portrait) get a narrow, tall layout instead of a shrunken wide one.
    var tall = box.clientWidth < 600;
    var W = Math.max(box.clientWidth, (tall ? { flow: 380, steps: 420 } : { flow: 560, steps: 640 })[kind] || (tall ? 340 : 900)), H;
    box.classList.add("is-live");

    var svg = d3.select(box).append("svg").attr("role", "img")
      .attr("aria-label", box.dataset.label || "Diagram");
    var arrows = kind !== "tree";
    if (arrows) svg.append("defs").append("marker").attr("id", "map-arrow").attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5)
        .attr("markerWidth", 7).attr("markerHeight", 7).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto")
        .append("path").attr("d", "M0 1 9 5 0 9z").attr("class", "map-arrow");
    var groupText = svg.append("g").selectAll("text").data(data.groups).join("text").attr("class", "map-group")
      .attr("text-anchor", "middle").text(function (g) { return g.name; });
    var line = svg.append("g").selectAll("path").data(data.links).join("path")
      .attr("class", function (l) { return "map-link" + (l.dotted ? " is-dotted" : ""); });
    if (arrows) line.attr("marker-end", "url(#map-arrow)");
    // Arrow labels sit on a small patch of the card's colour, so the line never runs through the words
    var label = svg.append("g").selectAll("g").data(data.links.filter(function (l) { return l.label; })).join("g").attr("class", "map-label");
    label.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").text(function (l) { return l.label; });
    label.each(function (l) {
      l.lw = this.querySelector("text").getComputedTextLength() + 10;
      d3.select(this).insert("rect", "text").attr("x", -l.lw / 2).attr("y", -9).attr("width", l.lw).attr("height", 18).attr("rx", 9);
    });
    var node = svg.append("g").selectAll("g").data(data.nodes).join("g")
      .attr("class", function (d) { return "map-node depth-" + d.level + (d.url ? " has-link" : ""); })
      .attr("tabindex", 0).attr("role", function (d) { return d.url ? "link" : null; }).attr("aria-label", function (d) { return d.name; });

    // Bubble = text with a rounded pill sized to it (the tree's centre is a circle)
    node.append("text").attr("text-anchor", "middle").attr("dy", "0.35em").text(function (d) { return d.name; });
    node.each(function (d) {
      var w = this.querySelector("text").getComputedTextLength();
      if (d.level === 0) { d.hw = d.hh = w / 2 + 14; d3.select(this).insert("circle", "text").attr("r", d.hw); return; }
      var h = d.level === 1 ? 34 : 28, pw = w + (d.level === 1 ? 28 : 22);
      d.hw = pw / 2; d.hh = h / 2;
      d3.select(this).insert("rect", "text").attr("x", -pw / 2).attr("y", -h / 2).attr("width", pw).attr("height", h).attr("rx", h / 2);
    });

    // Homes and height come after the pills are measured (the phone tree packs its rows by pill width)
    if (kind === "tree" && tall) {
      H = homesTreeTall(data, W);
      line.filter(function (l) { return l.source === 0; }).style("display", "none"); // centre lines would cut through the rows
    } else {
      H = heightFor(kind, data, W);
      ({ flow: homesFlow, steps: homesSteps }[kind] || homesTree)(data, W, H);
    }
    groupText.attr("x", function (g) { return g.x; }).attr("y", function (g) { return g.y; });
    svg.attr("viewBox", [0, 0, W, H]);
    box.style.height = Math.round(H * box.clientWidth / W) + "px";

    // Everything starts in the middle and springs out to its home; at home the springs are exactly relaxed
    data.nodes.forEach(function (d) { d.x = W / 2 + (d.tx - W / 2) * 0.08; d.y = H / 2 + (d.ty - H / 2) * 0.08; }); // already pointing home, so nothing tangles
    if (tall) data.nodes.forEach(function (d) { d.x = W / 2 + (d.tx - W / 2) * 0.3; d.y = d.ty; }); // tall: rows start in place and slide out sideways
    data.links.forEach(function (l) {
      var a = data.nodes[l.source], b = data.nodes[l.target];
      l.rest = Math.hypot(b.tx - a.tx, b.ty - a.ty);
      l.bend = 0;
      if (kind !== "steps") return;
      // steps: a pair of arrows going both ways curve apart; an arrow that would run through a step bends around it
      if (data.links.some(function (o) { return o.source === l.target && o.target === l.source; })) l.bend = 28;
      data.nodes.forEach(function (n) {
        if (n.rank <= Math.min(a.rank, b.rank) || n.rank >= Math.max(a.rank, b.rank)) return;
        var x = a.tx + (b.tx - a.tx) * (n.ty - a.ty) / (b.ty - a.ty);
        if (Math.abs(x - n.tx) < n.hw + 10) l.bend = Math.max(l.bend, 2 * (n.hw + 24));
      });
    });

    // Bubbles push each other apart by their real pill size, so names never overlap
    function noOverlap() {
      var all;
      function force() {
        for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
          var a = all[i], b = all[j], dx = b.x - a.x, dy = b.y - a.y;
          var ox = a.hw + b.hw + 8 - Math.abs(dx), oy = a.hh + b.hh + 6 - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          var wa = a.level === 0 ? 0 : b.level === 0 ? 1 : 0.5; // the centre is heavy: others bounce off it
          if (ox / (a.hw + b.hw) < oy / (a.hh + b.hh)) { var sx = dx < 0 ? -ox : ox; a.x -= sx * wa; b.x += sx * (1 - wa); }
          else { var sy = dy < 0 ? -oy : oy; a.y -= sy * wa; b.y += sy * (1 - wa); }
        }
      }
      force.initialize = function (n) { all = n; };
      return force;
    }

    var home = kind === "tree" ? 0.12 : 0.2;
    var sim = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(function (d) { return d.id; }).distance(function (l) { return l.rest; })
        .strength({ flow: 0.06, steps: 0.15 }[kind] || 0.3))
      .force("home-x", d3.forceX(function (d) { return d.tx; }).strength(function (d) { return d.level === 0 ? 0.5 : home; }))
      .force("home-y", d3.forceY(function (d) { return d.ty; }).strength(function (d) { return d.level === 0 ? 0.5 : home; }))
      .force("no-overlap", noOverlap())
      .alphaDecay(0.03)
      .on("tick", tick);

    function tick() {
      data.nodes.forEach(function (d) { // keep every bubble inside the card
        d.x = Math.max(d.hw + 6, Math.min(W - d.hw - 6, d.x));
        d.y = Math.max(d.hh + 6, Math.min(H - d.hh - 6, d.y));
      });
      line.each(function (l) {
        var a = l.source, b = l.target, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        // control point: pushed to the right of the arrow's direction by its bend (0 = straight)
        var cx = (a.x + b.x) / 2 - dy / len * l.bend, cy = (a.y + b.y) / 2 + dx / len * l.bend;
        var x2 = b.x, y2 = b.y;
        if (arrows) { // arrow stops at the edge of the target pill
          var ex = b.x - cx, ey = b.y - cy, t = Math.min(b.hw / Math.abs(ex || 1e-6), b.hh / Math.abs(ey || 1e-6), 1);
          x2 = b.x - ex * t * 1.04; y2 = b.y - ey * t * 1.04;
        }
        this.setAttribute("d", "M" + a.x + "," + a.y + "Q" + cx + "," + cy + " " + x2 + "," + y2);
        // rubber band: a stretched line gets thinner
        this.style.strokeWidth = Math.max(0.5, Math.min(1.4, 1.4 * Math.sqrt((l.rest || len) / len))) + "px";
        // label halfway along a short arrow; on a long one (skipping a step) 30% along, in the open gap near its start
        var f = Math.abs(b.rank - a.rank) > 1 ? 0.3 : 0.5, p = (1 - f) * (1 - f), q = 2 * f * (1 - f), r = f * f;
        l.lx = p * a.x + q * cx + r * x2; l.ly = p * a.y + q * cy + r * y2; l.side = -dy / len * l.bend;
      });
      label.attr("transform", function (l) { // on a curved arrow the label sits beside the curve, on a straight one on top of it
        var off = l.side > 0 ? l.lw / 2 + 2 : l.side < 0 ? -l.lw / 2 - 2 : 0;
        return "translate(" + (l.lx + off) + "," + l.ly + ")";
      });
      node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }
    if (calm) { sim.stop(); sim.tick(400); tick(); }

    // Drag: the bubble follows the finger and pulls its neighbours along.
    // Let go: it snaps back home with a springy overshoot (less friction for a moment)
    var springy;
    node.call(d3.drag().clickDistance(4)
      .on("start", function (e, d) {
        clearTimeout(springy); sim.velocityDecay(0.4);
        if (!e.active) sim.alphaTarget(0.25).restart();
        d.fx = d.x; d.fy = d.y; box.classList.add("is-dragging");
      })
      .on("drag", function (e, d) { d.fx = e.x; d.fy = e.y; })
      .on("end", function (e, d) {
        d.fx = d.fy = null; box.classList.remove("is-dragging");
        if (e.active) return;
        sim.alphaTarget(0);
        if (calm) { sim.alpha(0.6).restart(); return; }
        sim.velocityDecay(0.12).alpha(0.9).restart();
        springy = setTimeout(function () { sim.velocityDecay(0.4); }, 1400);
      }));

    // Click (without dragging) or Enter opens the page
    function go(d) { if (d.url && d.level) window.location.href = d.url; }
    node.on("click", function (e, d) { go(d); })
      .on("keydown", function (e, d) { if (e.key === "Enter") go(d); });

    // Hover: light up the bubble, its neighbours and their lines
    var near = {};
    data.links.forEach(function (l) { near[l.source.id + "," + l.target.id] = near[l.target.id + "," + l.source.id] = true; });
    function focus(d) {
      box.classList.toggle("has-focus", !!d);
      node.classed("is-near", function (o) { return d && (o === d || near[d.id + "," + o.id]); });
      line.classed("is-near", function (l) { return d && (l.source === d || l.target === d); });
    }
    node.on("mouseenter focus", function (e, d) { focus(d); }).on("mouseleave blur", function () { focus(null); });
  }

  function start(box) {
    if (window.d3) return draw(box);
    var s = document.querySelector('script[src="' + D3 + '"]');
    if (!s) { s = document.createElement("script"); s.src = D3; document.head.appendChild(s); }
    s.addEventListener("load", function () { draw(box); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".app-map").forEach(function (box) {
      if (!("IntersectionObserver" in window)) return start(box);
      var io = new IntersectionObserver(function (es) { // animate when scrolled into view
        if (es[0].isIntersecting) { io.disconnect(); start(box); }
      }, { threshold: 0.25 });
      io.observe(box);
    });
  });
})();
