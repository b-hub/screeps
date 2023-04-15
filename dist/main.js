'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SteveState;
(function (SteveState) {
    SteveState[SteveState["harvesting"] = 0] = "harvesting";
    SteveState[SteveState["upgrading"] = 1] = "upgrading";
    SteveState[SteveState["transferring"] = 2] = "transferring";
    SteveState[SteveState["null"] = 3] = "null";
})(SteveState || (SteveState = {}));
const body = () => [WORK, MOVE, CARRY];
const memory = (base) => (Object.assign(Object.assign({}, base), { state: SteveState.harvesting }));
const run$2 = (creep) => {
    const memory = creep.memory;
    switch (memory.state) {
        default:
        case SteveState.harvesting:
            memory.state = harvest(creep);
            break;
        case SteveState.upgrading:
            memory.state = upgrade(creep);
            break;
        case SteveState.transferring:
            memory.state = transfer(creep);
            break;
        case SteveState.null:
            // do nothing
            break;
    }
};
const harvest = (creep) => {
    const source = getClosestSource(creep);
    if (source === null) {
        creep.say("😢Steve has no purpose");
        creep.suicide();
        return SteveState.null;
    }
    const result = creep.harvest(source);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
    if (creep.store.getFreeCapacity() === 0) {
        creep.say("🚀");
        return SteveState.upgrading;
    }
    return SteveState.harvesting;
};
const upgrade = (creep) => {
    const controller = creep.room.controller;
    if (controller === undefined) {
        creep.say("no controller!");
        return SteveState.transferring;
    }
    const result = creep.upgradeController(controller);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
    }
    if (creep.store.getUsedCapacity() === 0) {
        creep.say("⛏️");
        return SteveState.harvesting;
    }
    return SteveState.upgrading;
};
const transfer = (creep) => {
    const spawn = getClosestSpawn(creep);
    if (spawn === null) {
        creep.say("no spawn!");
        creep.drop(RESOURCE_ENERGY);
        return SteveState.upgrading;
    }
    const result = creep.transfer(spawn, RESOURCE_ENERGY);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
    }
    if (creep.store.getUsedCapacity() === 0) {
        creep.say("⛏️");
        return SteveState.upgrading;
    }
    return SteveState.transferring;
};
const getClosestSource = (creep) => {
    const sources = creep.room.find(FIND_SOURCES);
    return sources.length > 0
        ? sources[0]
        : null;
};
const getClosestSpawn = (creep) => {
    const spawns = creep.room.find(FIND_MY_SPAWNS);
    return spawns.length > 0
        ? spawns[0]
        : null;
};

var CreepRole;
(function (CreepRole) {
    CreepRole["steve"] = "steve";
})(CreepRole || (CreepRole = {}));

const run$1 = () => {
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        runCreep(creep);
    }
};
const runCreep = (creep) => {
    const creepRole = creep.memory.role;
    switch (creepRole) {
        case CreepRole.steve:
            run$2(creep);
            break;
        default:
            console.log(`unknown creep role '${creepRole}'`);
            break;
    }
};

const run = () => {
    for (const name in Game.spawns) {
        const spawn = Game.spawns[name];
        runSpawn(spawn);
    }
};
const runSpawn = (spawn) => {
    const result = spawn.spawnCreep(body(), "Steve", {
        dryRun: true
    });
    if (result === OK) {
        spawn.spawnCreep(body(), "Steve", {
            dryRun: false,
            memory: memory({
                role: CreepRole.steve
            })
        });
    }
};

function cleanMemory() {
    // Automatically delete memory of missing creeps!!!!!!!!
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
}

// Call this function at the end of your main loop
function exportStats() {
    // Reset stats object
    Memory.stats = {
        gcl: getGclStats(),
        rooms: getRoomStats(),
        cpu: getCpuStats(),
        table: getTableStats(),
        time: Game.time
    };
}
function getRoomStats() {
    var _a, _b, _c;
    const roomStats = {};
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const isMyRoom = room.controller ? room.controller.my : false;
        if (isMyRoom) {
            roomStats[roomName] = {
                storageEnergy: room.storage ? room.storage.store.energy : 0,
                terminalEnergy: room.terminal ? room.terminal.store.energy : 0,
                energyAvailable: room.energyAvailable,
                energyCapacityAvailable: room.energyCapacityAvailable,
                controllerProgress: (_a = room.controller) === null || _a === void 0 ? void 0 : _a.progress,
                controllerProgressTotal: (_b = room.controller) === null || _b === void 0 ? void 0 : _b.progressTotal,
                controllerLevel: (_c = room.controller) === null || _c === void 0 ? void 0 : _c.level
            };
        }
    }
    return roomStats;
}
function getGclStats() {
    return {
        progress: Game.gcl.progress,
        progressTotal: Game.gcl.progressTotal,
        level: Game.gcl.level
    };
}
function getCpuStats() {
    return {
        bucket: Game.cpu.bucket,
        limit: Game.cpu.limit,
        used: Game.cpu.getUsed()
    };
}
function getTableStats() {
    const stats = {};
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

const gameLoop = () => {
    cleanMemory();
    run();
    run$1();
    exportStats();
};

// import { ErrorMapper } from "utils/ErrorMapper";
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
// export const loop = ErrorMapper.wrapLoop(gameLoop);
const loop = gameLoop;

exports.loop = loop;
