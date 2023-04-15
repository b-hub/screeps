

export const run = () => {
  for (const name in Game.rooms) {
    const spawn = Game.rooms[name];
    runRoom(spawn);
  }
};

const runRoom = (room: Room) => {
  room.visual.circle(10, 10, {fill: "red", radius: 0.3});
}
