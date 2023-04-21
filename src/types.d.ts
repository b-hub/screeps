// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  current: any;
  tmp?: any;
}

interface SpawnMemory {
  nextRole?: string;
}

interface RoomMemory {
  mineLocations?: MineLocation[];
}

interface MineLocation {
  sourcePos: Pos;
  minePos: Pos;
  allMinePos: Pos[];
  creepName?: string;
}

interface Pos {
  x: number;
  y: number;
}

interface RoomStats {
  storageEnergy: number;
  terminalEnergy: number;
  energyAvailable: number;
  energyCapacityAvailable: number;
  controllerProgress?: number;
  controllerProgressTotal?: number;
  controllerLevel?: number;
}

interface GclStats {
  progress: number;
  progressTotal: number;
  level: number;
}

interface CpuStats {
  bucket: number;
  limit: number;
  used: number;
}
interface RoomsStats {
  [key: string]: RoomStats
}
interface MemoryStats {
  gcl: GclStats;
  rooms: RoomsStats;
  cpu: CpuStats;
  table: TableStats;
  time: number;
}

interface Memory {
  uuid: number;
  log: any;
  stats: MemoryStats;
}

interface TableStats {
  [tableName: string]: TableStatsTable;
}

interface TableStatsTable {
  [columnName: string]: string; // property mapping
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
