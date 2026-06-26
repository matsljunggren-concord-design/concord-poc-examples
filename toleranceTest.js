export const metadata = {
  id: 'tolerance-test',
  name: 'Tolerance test',
  description: 'Homes the machine, then draws nested shapes and crosshairs to test for backlash and repeatability.',
  order: 50,
};

const TOOL_OUTPUT_ID = 1;

async function penDown(controller) {
  await controller.motionController.setOutput({outputIDAndValues: [{outputID: TOOL_OUTPUT_ID, value: true}]});
}

async function penUp(controller) {
  await controller.motionController.setOutput({outputIDAndValues: [{outputID: TOOL_OUTPUT_ID, value: false}]});
}

export async function run({controller, setPosition, log, api}) {
  log('Homing...');
  await controller.home();
  setPosition(api.position({x: 0, y: 0}));

  log('Tolerance test start');

  // Test 1: Outer boundary square (180 × 180 mm)
  await penUp(controller);
  await controller.jump({position: api.position({x: 10, y: 10})});
  await penDown(controller);
  await controller.move({
    positions: [
      api.position({x: 190, y: 10}),
      api.position({x: 190, y: 190}),
      api.position({x: 10, y: 190}),
      api.position({x: 10, y: 10}),
    ],
  });
  log('Square done');

  // Test 2: Diagonal X
  await controller.move({positions: [api.position({x: 190, y: 190})]});
  await penUp(controller);
  await controller.jump({position: api.position({x: 10, y: 190})});
  await penDown(controller);
  await controller.move({positions: [api.position({x: 190, y: 10})]});
  log('Diagonal X done');

  // Test 3: Concentric repeatability — jump to each corner, return to center, draw a 5 × 5 mm box
  const center = api.position({x: 100, y: 100});
  const corners = [
    {x: 20, y: 20},
    {x: 180, y: 20},
    {x: 180, y: 180},
    {x: 20, y: 180},
  ];

  for (const corner of corners) {
    await penUp(controller);
    await controller.jump({position: api.position(corner)});
    await controller.jump({position: center});
    await penDown(controller);
    await controller.move({
      positions: [
        api.position({x: 102.5, y: 100}),
        api.position({x: 102.5, y: 102.5}),
        api.position({x: 97.5, y: 102.5}),
        api.position({x: 97.5, y: 97.5}),
        api.position({x: 102.5, y: 97.5}),
        api.position({x: 102.5, y: 100}),
      ],
    });
    log(`Corner (${corner.x}, ${corner.y}) done`);
  }

  // Return to home
  await penUp(controller);
  await controller.jump({position: api.position({x: 0, y: 0})});
  setPosition(api.position({x: 0, y: 0}));

  log('Tolerance test complete');
}
