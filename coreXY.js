// CoreXY machine profile.
//
// CoreXY kinematics: two motors (A, B) drive the toolhead via crossed belts.
//   motorA = x + y  (firmware axis 1)
//   motorB = x - y  (firmware axis 2)
//
// The custom CoreXYKinematics class is defined inline — it only needs to
// implement the three IKinematics methods (toPulses, fromPulses, validatePosition).
// No imports from the bundle required beyond Box2d.

class CoreXYKinematics {
  constructor({boundary, pulsesPerMM}) {
    this.boundary = boundary;
    this._pulsesPerMM = pulsesPerMM;
  }

  toPulses({x, y}) {
    const p = this._pulsesPerMM;
    return {
      x: Math.round((x + y) * p),  // motor A
      y: Math.round((x - y) * p),  // motor B
    };
  }

  fromPulses({x: motorA, y: motorB}) {
    const p = this._pulsesPerMM;
    return {
      x: (motorA + motorB) / 2 / p,
      y: (motorA - motorB) / 2 / p,
    };
  }

  validatePosition({x, y}) {
    const b = this.boundary;
    if (x < b.minimumX || x > b.maximumX || y < b.minimumY || y > b.maximumY) {
      throw new Error(
        `CoreXYKinematics: position (${x}, ${y}) outside boundary ` +
        `[${b.minimumX},${b.minimumY}]–[${b.maximumX},${b.maximumY}]`,
      );
    }
  }
}

export async function create({Box2d}) {
  const boundary = new Box2d({minimumX: 0, minimumY: 0, maximumX: 300, maximumY: 300});
  return {
    id: 'corexy',
    name: 'CoreXY (300×300 mm)',
    defaultServerAddress: 'ws://corexy-robot.local/ws',
    boundary,
    kinematics: new CoreXYKinematics({boundary, pulsesPerMM: 100}),
  };
}
