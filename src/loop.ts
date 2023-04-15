import * as CreepManager from "managers/CreepManager";
import * as SpawnManager from "managers/SpawnManager";
import * as RoomManager from "managers/RoomManager";
import { cleanMemory } from "utils/GameUtils";
import { exportStats } from "utils/StatsUtils";

export const gameLoop = () => {
  cleanMemory();

  RoomManager.run();
  SpawnManager.run();
  CreepManager.run();

  exportStats();
};
