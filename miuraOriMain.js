// Miura-Ori flasher crease pattern — 9×9 main diagram.
//
// Source: 9x9_main.svg  (viewBox 0–9, 10 cm × 10 cm)
// Line types: B = boundary, M = mountain fold, V = valley fold.
//
// Coordinate mapping:
//   x_mm = x_svg * SCALE + OX
//   y_mm = (9 - y_svg) * SCALE + OY   (SVG y-down → machine y-up)
//
// SCALE = 20 → 180 × 180 mm pattern, 10 mm margin on a 200 × 200 mm bed.
//
// The tool output (ID 1) is engaged for each scored segment and lifted
// between segments.  Mountain and valley folds are plotted in separate
// passes so machine parameters (depth, speed) can be adjusted between them.

export const metadata = {
  id: 'miura-ori-main',
  name: 'Miura-Ori Flasher (9×9)',
  description:
    'Scores the Miura-Ori flasher crease pattern (9×9 grid) onto a 180×180 mm sheet. ' +
    'Pass order: boundary → mountain folds → valley folds.',
  order: 60,
};

const SCALE = 20; // mm per SVG unit
const OX = 10;   // x offset (mm)
const OY = 10;   // y offset (mm)

function pt(x, y) {
  return {x: x * SCALE + OX, y: (9 - y) * SCALE + OY};
}

// ─── Line data extracted from 9x9_main.svg ───────────────────────────────────
// Each entry: [x1, y1, x2, y2] in SVG grid coordinates (integers 0–9).

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
  [8,1, 8,2],
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

// ─── Plotting ─────────────────────────────────────────────────────────────────

async function plotSegments(controller, segments, api, label, log) {
  log(`${label}: ${segments.length} segments`);
  for (const [x1, y1, x2, y2] of segments) {
    await toolUp(controller);
    await controller.jump({position: api.position(pt(x1, y1))});
    await toolDown(controller);
    await controller.move({positions: [api.position(pt(x2, y2))]});
  }
  log(`${label}: done`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function run({controller, setPosition, log, api}) {
  await toolUp(controller);

  log('Homing...');
  await controller.home();
  setPosition(api.position({x: 0, y: 0}));

  // Boundary first so the sheet position is visible before scoring creases.
  await plotSegments(controller, BOUNDARY, api, 'Boundary', log);

  // Mountain and valley in separate passes — adjust tool depth/speed between them.
  await plotSegments(controller, MOUNTAIN, api, 'Mountain (M)', log);
  await plotSegments(controller, VALLEY,   api, 'Valley (V)',   log);

  await toolUp(controller);
  await controller.jump({position: api.position({x: 0, y: 0})});
  setPosition(api.position({x: 0, y: 0}));
  log('Miura-Ori flasher complete.');
}
