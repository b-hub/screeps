'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SteveState;
(function (SteveState) {
    SteveState[SteveState["harvesting"] = 0] = "harvesting";
    SteveState[SteveState["upgrading"] = 1] = "upgrading";
})(SteveState || (SteveState = {}));
class Steve {
    static run(creep) {
        var memory = creep.memory;
        switch (memory.state) {
            default:
            case SteveState.harvesting:
                var source = getClosestSource(creep);
                memory.state = harvest(creep, source);
                break;
            case SteveState.upgrading:
                var controller = creep.room.controller;
                if (controller === undefined) {
                    creep.say("no controller!");
                }
                else {
                    memory.state = upgrade(creep, controller);
                }
                break;
        }
    }
}
function harvest(creep, source) {
    var result = creep.harvest(source);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
    if (creep.store.getFreeCapacity() === 0) {
        creep.say("upgrading");
        return SteveState.upgrading;
    }
    return SteveState.harvesting;
}
function upgrade(creep, controller) {
    var result = creep.upgradeController(controller);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
    }
    if (creep.store.getUsedCapacity() === 0) {
        creep.say("harvesting");
        return SteveState.harvesting;
    }
    return SteveState.upgrading;
}
function getClosestSource(creep) {
    return creep.room.find(FIND_SOURCES)[0];
}

var CreepRole;
(function (CreepRole) {
    CreepRole[CreepRole["steve"] = 1] = "steve";
})(CreepRole || (CreepRole = {}));

class CreepManager {
    static run() {
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            CreepManager.runCreep(creep);
        }
    }
    static runCreep(creep) {
        var creepRole = creep.memory.role;
        switch (creepRole) {
            case CreepRole.steve:
                Steve.run(creep);
                break;
            default:
                console.log(`unknown creep role '${creepRole}'`);
                break;
        }
    }
}

class SpawnManager {
    static run() {
        for (var name in Game.spawns) {
            var spawn = Game.spawns[name];
            SpawnManager.runSpawn(spawn);
        }
    }
    static runSpawn(spawn) {
        var result = spawn.spawnCreep([WORK, MOVE, CARRY], "Steve", {
            dryRun: true
        });
        if (result === OK) {
            spawn.spawnCreep([WORK, MOVE, CARRY], "Steve", {
                dryRun: false,
                memory: {
                    role: CreepRole.steve,
                    room: "",
                    working: false
                }
            });
        }
    }
}

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
    var _a, _b, _c;
    // Reset stats object
    Memory.stats = {
        gcl: {},
        rooms: {},
        cpu: {},
    };
    Memory.stats.time = Game.time;
    // Collect room stats
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        let isMyRoom = (room.controller ? room.controller.my : false);
        if (isMyRoom) {
            let roomStats = Memory.stats.rooms[roomName] = {};
            roomStats.storageEnergy = (room.storage ? room.storage.store.energy : 0);
            roomStats.terminalEnergy = (room.terminal ? room.terminal.store.energy : 0);
            roomStats.energyAvailable = room.energyAvailable;
            roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
            roomStats.controllerProgress = (_a = room.controller) === null || _a === void 0 ? void 0 : _a.progress;
            roomStats.controllerProgressTotal = (_b = room.controller) === null || _b === void 0 ? void 0 : _b.progressTotal;
            roomStats.controllerLevel = (_c = room.controller) === null || _c === void 0 ? void 0 : _c.level;
        }
    }
    // Collect GCL stats
    Memory.stats.gcl.progress = Game.gcl.progress;
    Memory.stats.gcl.progressTotal = Game.gcl.progressTotal;
    Memory.stats.gcl.level = Game.gcl.level;
    // Collect CPU stats
    Memory.stats.cpu.bucket = Game.cpu.bucket;
    Memory.stats.cpu.limit = Game.cpu.limit;
    Memory.stats.cpu.used = Game.cpu.getUsed();
}

const gameLoop = () => {
    console.log(`Current game tick is ${Game.time}`);
    cleanMemory();
    SpawnManager.run();
    CreepManager.run();
    exportStats();
};

//import { ErrorMapper } from "utils/ErrorMapper";
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
//export const loop = ErrorMapper.wrapLoop(gameLoop);
const loop = gameLoop;

exports.loop = loop;
