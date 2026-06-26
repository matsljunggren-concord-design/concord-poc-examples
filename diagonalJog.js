export const metadata = {
  id: 'diagonal-jog',
  name: 'External diagonal jog 2',
  description: 'Move diagonally by 10 mm using the portable example API.',
  order: 100,
};

export async function run({controller, boundary, position, setPosition, log, api}) {
  const target = api.position({
    x: Math.min(position.x + 10, boundary.maximumX),
    y: Math.min(position.y + 10, boundary.maximumY),
  });

  log(`External example moving to (${target.x.toFixed(1)}, ${target.y.toFixed(1)}) mm`);
  await controller.jump({position: target});

  setPosition(target);
}
