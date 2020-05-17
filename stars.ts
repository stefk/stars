// simple euclidean algorithm
export function gcd(a: number, b: number): number {
  if (a === b) {
    return a;
  }

  return a < b ? gcd(a, b - a) : gcd(b, a - b);
}

// find possible jumps if we want to make a star from
// a given number of points lying on a circle
export function jumps(points: number): number[] {
  const result: number[] = [];

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

export function edges(points: number, jump: number): [number, number][] {
  const result: [number, number][] = [];
  let start = 0;

  do {
    result.push([start, (start + jump) % points]);
    start = (start + jump) % points;
  } while (start !== 0);

  return result;
}

export function pointCoords(
  points: number,
  radius: number,
): [number, number][] {
  const angle = 2 * Math.PI / points;
  const coords: [number, number][] = [];

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

export function pathLength(
  pointCoords: [number, number][],
  jump: number,
): number {
  // since gcd(points, jump) = 1, lcm = points * jump
  const jumpCount = pointCoords.length;
  const [x1, y1] = pointCoords[0];
  const [x2, y2] = pointCoords[jump];
  const jumpLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return jumpLength * jumpCount;
}

export function svgCoords(
  coords: [number, number][],
  radius: number,
): [string, string][] {
  // translate coords into the svg coordinates
  // system ((0, 0) to (500, 500)) and fix decimals
  return coords.map(([x, y]) => {
    return [
      (x + radius).toFixed(3),
      (radius - y).toFixed(3),
    ];
  });
}

export function svgPath(
  svgCoords: [string, string][],
  edges: [number, number][],
): string {
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

interface Star {
  points: number;
  jump: number;
  path: string;
  pathLength: string;
  availableJumps: number[];
}

export function star(
  radius: number,
  points: number,
  jump?: number,
): Star | undefined {
  const availableJumps = jumps(points);
  let actualJump: number;

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

interface StarData {
  points: number;
  availableJumps: number[];
}

export function starData(start: number, end: number): StarData[] {
  const infos: StarData[] = [];

  for (let i = start; i <= end; ++i) {
    const availableJumps = jumps(i);

    if (availableJumps.length > 0) {
      infos.push({
        points: i,
        availableJumps
      });
    }
  }

  return infos;
}

