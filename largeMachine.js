// Example external machine profile — 400 × 400 mm large-format XY robot.
//
// Drop this file (or any .js file exporting `create`) into the machine profile
// loader in the Machine tab. The app reconnects automatically with the new
// kinematics and boundary.

export async function create({Box2d, XYRobotKinematics}) {
  const boundary = new Box2d({minimumX: 0, minimumY: 0, maximumX: 400, maximumY: 400});
  return {
    id: 'large-machine',
    name: 'Large Machine (400×400 mm)',
    defaultServerAddress: 'ws://esp32-robot-8bfc.local/ws',
    boundary,
    kinematics: new XYRobotKinematics({boundary, xPulsesPerMM: 80, yPulsesPerMM: 80}),
  };
}
