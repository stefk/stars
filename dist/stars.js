// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

System.register("stars", [], function (exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  // simple euclidean algorithm
  function gcd(a, b) {
    if (a === b) {
      return a;
    }
    return a < b ? gcd(a, b - a) : gcd(b, a - b);
  }
  exports_1("gcd", gcd);
  // find possible jumps if we want to make a star from
  // a given number of points lying on a circle
  function jumps(points) {
    const result = [];
    if (points < 5) {
      // no stars under 5 points
      return result;
    }
    for (let i = 2; i < points - 1; ++i) {
      // jumps will reach all the points iff
      // the jump interval and the number of
      // points are coprime
      if (gcd(points, i) === 1) {
        // the jump set of (points - x) is just the
        // jump set of x in reverse order, so we can
        // safely ignore it
        if (!result.includes(points - i)) {
          result.push(i);
        }
      }
    }
    return result;
  }
  exports_1("jumps", jumps);
  function edges(points, jump) {
    const result = [];
    let start = 0;
    do {
      result.push([start, (start + jump) % points]);
      start = (start + jump) % points;
    } while (start !== 0);
    return result;
  }
  exports_1("edges", edges);
  function pointCoords(points, radius) {
    const angle = 2 * Math.PI / points;
    const coords = [];
    for (let i = 0; i < points; ++i) {
      // we want the first point to be at the middle top, so
      // we're basically making a 90° counter-clockwise rotation
      // (assuming the star center is at (0, 0))
      coords.push([
        -Math.sin(i * angle) * radius,
        Math.cos(i * angle) * radius,
      ]);
    }
    return coords;
  }
  exports_1("pointCoords", pointCoords);
  function pathLength(pointCoords, jump) {
    // since gcd(points, jump) = 1, lcm = points * jump
    const jumpCount = pointCoords.length;
    const [x1, y1] = pointCoords[0];
    const [x2, y2] = pointCoords[jump];
    const jumpLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return jumpLength * jumpCount;
  }
  exports_1("pathLength", pathLength);
  function svgCoords(coords, radius) {
    // translate coords into the svg coordinates
    // system ((0, 0) to (500, 500)) and fix decimals
    return coords.map(([x, y]) => {
      return [
        (x + radius).toFixed(3),
        (radius - y).toFixed(3),
      ];
    });
  }
  exports_1("svgCoords", svgCoords);
  function svgPath(svgCoords, edges) {
    const svgEdges = edges.map((
      [start, end],
    ) => ([svgCoords[start], svgCoords[end]]));
    return svgEdges.reduce((acc, [start, end]) => {
      if (acc === "") {
        return `M ${start[0]} ${start[1]} L ${end[0]} ${end[1]}`;
      }
      return `${acc} L ${end[0]} ${end[1]}`;
    }, "");
  }
  exports_1("svgPath", svgPath);
  function star(radius, points, jump) {
    const availableJumps = jumps(points);
    let actualJump;
    if (availableJumps.length === 0) {
      return;
    }
    if (jump) {
      if (!availableJumps.includes(jump)) {
        return;
      }
      actualJump = jump;
    } else {
      const sorted = availableJumps.sort((a, b) =>
        points % a > points % b ? -1 : 1
      );
      actualJump = sorted[0];
    }
    const coords = pointCoords(points, radius);
    const length = pathLength(coords, actualJump);
    const path = svgPath(svgCoords(coords, radius), edges(points, actualJump));
    return {
      points,
      jump: actualJump,
      path,
      pathLength: length.toFixed(3),
      availableJumps,
    };
  }
  exports_1("star", star);
  function starData(start, end) {
    const infos = [];
    for (let i = start; i <= end; ++i) {
      const availableJumps = jumps(i);
      if (availableJumps.length > 0) {
        infos.push({
          points: i,
          availableJumps,
        });
      }
    }
    return infos;
  }
  exports_1("starData", starData);
  return {
    setters: [],
    execute: function () {
    },
  };
});

const __exp = __instantiate("stars");
export const gcd = __exp["gcd"];
export const jumps = __exp["jumps"];
export const edges = __exp["edges"];
export const pointCoords = __exp["pointCoords"];
export const pathLength = __exp["pathLength"];
export const svgCoords = __exp["svgCoords"];
export const svgPath = __exp["svgPath"];
export const star = __exp["star"];
export const starData = __exp["starData"];

