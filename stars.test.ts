import {
  assertEquals,
  assertStrictEq,
} from "https://deno.land/std/testing/asserts.ts";
import {
  gcd,
  jumps,
  edges,
  pointCoords,
  pathLength,
  svgCoords,
  svgPath,
  star,
} from "./stars.ts";
const { test } = Deno;

test("gcd", () => {
  assertStrictEq(gcd(1, 1), 1);
  assertStrictEq(gcd(1, 2), 1);
  assertStrictEq(gcd(2, 3), 1);
  assertStrictEq(gcd(2, 4), 2);
  assertStrictEq(gcd(5, 10), 5);
  assertStrictEq(gcd(50, 75), 25);
  assertStrictEq(gcd(1683, 1989), 153);
});

test("jumps", () => {
  assertEquals([], jumps(0));
  assertEquals([], jumps(1));
  assertEquals([], jumps(2));
  assertEquals([], jumps(4));
  assertEquals([2], jumps(5));
  assertEquals([], jumps(6));
  assertEquals([2, 3], jumps(7));
  assertEquals([5], jumps(12));
  assertEquals([3, 5, 7], jumps(16));
  assertEquals(
    [
      3,
      7,
      9,
      11,
      13,
      17,
      19,
      21,
      23,
      27,
      29,
      31,
      33,
      37,
      39,
      41,
      43,
      47,
      49,
    ],
    jumps(100),
  );
});

test("edges", () => {
  assertEquals(
    [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0]],
    edges(5, 2),
  );
  assertEquals(
    [[0, 2], [2, 4], [4, 6], [6, 1], [1, 3], [3, 5], [5, 0]],
    edges(7, 2),
  );
  assertEquals(
    [[0, 3], [3, 6], [6, 2], [2, 5], [5, 1], [1, 4], [4, 0]],
    edges(7, 3),
  );
});

test("pointCoords", () => {
  assertEquals(
    [
      [-0, 500],
      [-475.52825814757676, 154.50849718747372],
      [-293.89262614623664, -404.50849718747367],
      [293.8926261462365, -404.5084971874737],
      [475.5282581475768, 154.5084971874736],
    ],
    pointCoords(5, 500),
  );
});

test("pathLength", () => {
  assertEquals(
    4755.282581475768,
    pathLength(pointCoords(5, 500), 2),
  );
});

test("svgCoords", () => {
  assertEquals(
    [
      ["500.000", "0.000"],
      ["24.472", "345.492"],
      ["206.107", "904.508"],
      ["793.893", "904.508"],
      ["975.528", "345.492"],
    ],
    svgCoords(pointCoords(5, 500), 500),
  );
});

test("svgPath", () => {
  assertEquals(
    "M 500.000 0.000 L 206.107 904.508 L 975.528 345.492 L 24.472 345.492 L 793.893 904.508 L 500.000 0.000",
    svgPath(svgCoords(pointCoords(5, 500), 500), edges(5, 2)),
  );
});

test("star", () => {
  assertEquals(undefined, star(10, 6, 2));
  assertEquals(undefined, star(10, 7, 7));
  assertEquals(
    {
      points: 5,
      jump: 2,
      path:
        "M 500.000 0.000 L 206.107 904.508 L 975.528 345.492 L 24.472 345.492 L 793.893 904.508 L 500.000 0.000",
      pathLength: "4755.283",
      availableJumps: [2],
    },
    star(500, 5, 2),
  );
});
