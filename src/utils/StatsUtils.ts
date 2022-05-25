// Call this function at the end of your main loop

export function exportStats() {
  // Reset stats object
  Memory.stats = {
    gcl: getGclStats(),
    rooms: getRoomStats(),
    cpu: getCpuStats(),
    table: getTableStats(),
    time: Game.time
  };
}

function getRoomStats(): RoomsStats {
  const roomStats: RoomsStats = {};

  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];

    const isMyRoom = room.controller ? room.controller.my : false;
    if (isMyRoom) {
      roomStats[roomName] = {
        storageEnergy: room.storage ? room.storage.store.energy : 0,
        terminalEnergy: room.terminal ? room.terminal.store.energy : 0,
        energyAvailable: room.energyAvailable,
        energyCapacityAvailable: room.energyCapacityAvailable,
        controllerProgress: room.controller?.progress,
        controllerProgressTotal: room.controller?.progressTotal,
        controllerLevel: room.controller?.level
      };
    }
  }

  return roomStats;
}

function getGclStats(): GclStats {
  return {
    progress: Game.gcl.progress,
    progressTotal: Game.gcl.progressTotal,
    level: Game.gcl.level
  };
}

function getCpuStats(): CpuStats {
  return {
    bucket: Game.cpu.bucket,
    limit: Game.cpu.limit,
    used: Game.cpu.getUsed()
  };
}

function getTableStats(): TableStats {
  const stats: TableStats = {};

  stats.game = {
    gameTime: "time",
    cpuBucket: "cpu.bucket",
    cpuLimit: "cpu.limit",
    cpuUsed: "cpu.used",
    gclProgress: "gcl.progress",
    gclProgressTotal: "gcl.progressTotal",
    gclLevel: "gcl.level"
  };

  return stats;
}
