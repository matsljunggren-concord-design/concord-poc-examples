// Miura-Ori flasher crease pattern — hole punch mode.
//
// Punches evenly spaced holes along each crease line in 9x9_main.svg.
// Motion per hole: jump to position (tool up) → tool down → tool up.
//
// Adjust HOLE_SPACING_MM at the top to change hole density.
// Set PUNCH_BOUNDARY = true to also perforate the sheet outline.

export const metadata = {
  id: 'miura-ori-punch',
  name: 'Miura-Ori Flasher — Hole Punch',
  description:
    'Punches evenly spaced holes along each Miura-Ori crease line (mountain and valley). ' +
    'Tool down = punch, tool up = retract. Adjust HOLE_SPACING_MM at top of file.',
  order: 61,
};

const HOLE_SPACING_MM = 5;  // distance between holes along each crease
const PUNCH_BOUNDARY  = false; // set true to also perforate the sheet outline

const SCALE = 20; // mm per SVG unit  →  180 × 180 mm on a 200 × 200 mm bed
const OX = 10;   // x offset (mm)
const OY = 10;   // y offset (mm)

function pt(x, y) {
  return {x: x * SCALE + OX, y: (9 - y) * SCALE + OY};
}

// ─── Line data from 9x9_main.svg ─────────────────────────────────────────────

const BOUNDARY = [
  [0,0, 0,1], [0,1, 0,2], [0,2, 0,3], [0,3, 0,4], [0,4, 0,5],
  [0,5, 0,6], [0,6, 0,7], [0,7, 0,8], [0,8, 0,9],
  [1,0, 0,0], [2,0, 1,0], [3,0, 2,0], [4,0, 3,0], [5,0, 4,0],
  [6,0, 5,0], [7,0, 6,0], [8,0, 7,0], [9,0, 8,0],
  [9,0, 9,1], [9,1, 9,2], [9,2, 9,3], [9,3, 9,4], [9,4, 9,5],
  [9,5, 9,6], [9,6, 9,7], [9,7, 9,8], [9,8, 9,9],
  [0,9, 1,9], [1,9, 2,9], [2,9, 3,9], [3,9, 4,9], [4,9, 5,9],
  [5,9, 6,9], [6,9, 7,9], [7,9, 8,9], [8,9, 9,9],
];

const MOUNTAIN = [
  // Centre square
  [4,4, 4,5], [5,5, 5,4], [5,4, 4,4], [4,5, 4,6],
  [4,4, 3,4], [5,4, 5,3], [5,5, 6,5],
  [4,5, 5,5],

  // Upper-left quadrant
  [0,2, 1,2], [1,2, 2,2], [2,2, 3,2],
  [3,2, 3,1], [3,1, 3,0],
  [4,3, 3,2], [2,1, 1,0],
  [1,4, 0,4],
  [2,4, 1,4], [3,4, 2,4],

  // Upper-right quadrant
  [5,3, 5,2], [5,2, 5,1], [5,1, 5,0],
  [7,0, 7,1], [7,1, 7,2], [7,2, 7,3],
  [7,3, 8,3], [8,3, 9,3],
  [7,3, 6,4],
  [8,2, 9,1],
  [8,5, 9,5],

  // Lower-left quadrant
  [0,6, 1,6], [1,6, 2,6], [2,6, 2,7], [2,7, 2,8], [2,8, 2,9],
  [3,5, 2,6],
  [4,6, 4,7], [4,7, 4,8], [4,8, 4,9],
  [1,7, 0,8],

  // Lower-right quadrant
  [6,5, 7,5], [7,5, 8,5],
  [5,6, 6,7],
  [6,7, 6,8], [6,8, 6,9],
  [7,7, 6,7], [8,7, 7,7],
  [9,7, 8,7],
  [7,8, 8,9],
];

const VALLEY = [
  // Centre diagonals
  [3,5, 4,4], [4,3, 5,4], [6,4, 5,5], [4,5, 5,6],

  // Upper-left quadrant
  [4,0, 4,1], [4,1, 4,2], [4,2, 4,3],
  [4,3, 3,3], [3,3, 2,3], [2,3, 1,3], [1,3, 0,3],
  [2,0, 2,1], [2,1, 1,1], [1,1, 0,1],
  [3,2, 3,3],
  [2,5, 3,5],

  // Upper-right quadrant
  [6,1, 6,2], [6,2, 6,3], [6,3, 6,4],
  [6,4, 7,4], [7,4, 8,4], [8,4, 9,4],
  [7,3, 8,2], [8,2, 9,2],
  [8,1, 8,2],
  [0,5, 1,5], [1,5, 2,5],

  // Lower-left quadrant
  [3,5, 3,6], [3,6, 3,7], [3,7, 3,8], [3,8, 3,9],
  [2,6, 1,7], [1,7, 1,8], [1,8, 1,9],
  [0,7, 1,7],
  [2,6, 3,6],
  [5,7, 5,6],
  [5,8, 5,7], [5,9, 5,8],

  // Lower-right quadrant
  [5,6, 6,6], [6,6, 7,6], [7,6, 8,6], [8,6, 9,6],
  [6,7, 7,8], [7,8, 7,9],
  [8,8, 7,8], [9,8, 8,8],
  [8,6, 9,6],
];

// ─── Tool control ─────────────────────────────────────────────────────────────

const TOOL_ID = 1;

function toolDown(controller) {
  return controller.motionController.setOutput({
    outputIDAndValues: [{outputID: TOOL_ID, value: true}],
  });
}

function toolUp(controller) {
  return controller.motionController.setOutput({
    outputIDAndValues: [{outputID: TOOL_ID, value: false}],
  });
}

// ─── Punching ─────────────────────────────────────────────────────────────────

// Distribute holes at HOLE_SPACING_MM intervals along a single SVG line segment.
// Always includes both endpoints.
async function punchSegment(controller, x1, y1, x2, y2, api, dotColor) {
  const start = pt(x1, y1);
  const end   = pt(x2, y2);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Number of holes: at least 2 (endpoints), then one per spacing interval.
  const count = Math.max(2, Math.round(length / HOLE_SPACING_MM) + 1);

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const pos = api.position({x: start.x + dx * t, y: start.y + dy * t});
    await controller.jump({position: pos});
    await toolDown(controller);
    await toolUp(controller);
    api.dot(pos, dotColor);
  }
}

async function punchSegments(controller, segments, api, label, log, dotColor) {
  let total = 0;
  for (const [x1, y1, x2, y2] of segments) {
    const dx = (x2 - x1) * SCALE;
    const dy = (y2 - y1) * SCALE;
    total += Math.max(2, Math.round(Math.sqrt(dx * dx + dy * dy) / HOLE_SPACING_MM) + 1);
  }
  log(`${label}: ${segments.length} segments → ~${total} holes`);
  for (const [x1, y1, x2, y2] of segments) {
    await punchSegment(controller, x1, y1, x2, y2, api, dotColor);
  }
  log(`${label}: done`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function run({controller, setPosition, log, api}) {
  await toolUp(controller);

  log('Homing...');
  await controller.home();
  setPosition(api.position({x: 0, y: 0}));

  if (PUNCH_BOUNDARY) {
    await punchSegments(controller, BOUNDARY, api, 'Boundary', log, '#94a3b8');
  }

  await punchSegments(controller, MOUNTAIN, api, 'Mountain (M)', log, '#f87171');
  await punchSegments(controller, VALLEY,   api, 'Valley (V)',   log, '#60a5fa');

  await toolUp(controller);
  await controller.jump({position: api.position({x: 0, y: 0})});
  setPosition(api.position({x: 0, y: 0}));
  log('Miura-Ori punch complete.');
}
