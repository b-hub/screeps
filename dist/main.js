'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var RunnerCreepState;
(function (RunnerCreepState) {
    RunnerCreepState[RunnerCreepState["harvesting"] = 0] = "harvesting";
    RunnerCreepState[RunnerCreepState["running"] = 1] = "running";
})(RunnerCreepState || (RunnerCreepState = {}));
class RunnerCreep {
    static run(creep) {
        var memory = creep.memory;
        switch (memory.state) {
            default:
            case RunnerCreepState.harvesting:
                var source = getClosestSource(creep);
                memory.state = harvest(creep, source);
                break;
            case RunnerCreepState.running:
                var spawn = getClosestSpawn(creep);
                memory.state = running(creep, spawn);
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
        creep.say("running");
        return RunnerCreepState.running;
    }
    return RunnerCreepState.harvesting;
}
function running(creep, spawn) {
    var result = creep.transfer(spawn, RESOURCE_ENERGY);
    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
    }
    else if (result === ERR_FULL) {
        creep.drop(RESOURCE_ENERGY);
    }
    if (creep.store.getUsedCapacity() === 0) {
        creep.say("harvesting");
        return RunnerCreepState.harvesting;
    }
    return RunnerCreepState.running;
}
function getClosestSource(creep) {
    return creep.room.find(FIND_SOURCES)[0];
}
function getClosestSpawn(creep) {
    return creep.room.find(FIND_MY_SPAWNS)[0];
}

var CreepRole;
(function (CreepRole) {
    CreepRole[CreepRole["runner"] = 1] = "runner";
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
            case CreepRole.runner:
                RunnerCreep.run(creep);
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
                    role: CreepRole.runner,
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

const gameLoop = () => {
    console.log(`Current game tick is ${Game.time}`);
    cleanMemory();
    SpawnManager.run();
    CreepManager.run();
};

//import { ErrorMapper } from "utils/ErrorMapper";
// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
//export const loop = ErrorMapper.wrapLoop(gameLoop);
const loop = gameLoop;

exports.loop = loop;
