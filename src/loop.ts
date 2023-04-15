import * as CreepManager from "managers/CreepManager";
import * as SpawnManager from "managers/SpawnManager";
import * as RoomManager from "managers/RoomManager";
import * as Steve from "creeps/Steve";
import { cleanMemory } from "utils/GameUtils";
import { exportStats } from "utils/StatsUtils";

export const gameLoop = () => {
  cleanMemory();

  Steve.run();

  RoomManager.run();
  SpawnManager.run();
  CreepManager.run();

  exportStats();
};
