interface RunnerCreepMemory extends CreepMemory {
    state: RunnerCreepState
}

export enum RunnerCreepState {
    harvesting,
    running,
}

export class RunnerCreep {

    public static run(creep: Creep) {
        var memory = creep.memory as RunnerCreepMemory;

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

function harvest(creep: Creep, source: Source): RunnerCreepState {
    var result = creep.harvest(source);
    if(result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }

    if (creep.store.getFreeCapacity() === 0) {
        creep.say("running");
        return RunnerCreepState.running;
    }

    return RunnerCreepState.harvesting;
}

function running(creep: Creep, spawn: StructureSpawn): RunnerCreepState {
    var result = creep.transfer(spawn, RESOURCE_ENERGY);

    if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
    } else if (result === ERR_FULL) {
        creep.drop(RESOURCE_ENERGY);
    }

    if (creep.store.getUsedCapacity() === 0) {
        creep.say("harvesting");
        return RunnerCreepState.harvesting;
    }

    return RunnerCreepState.running;
}

function getClosestSource(creep: Creep) {
    return creep.room.find(FIND_SOURCES)[0];
}

function getClosestSpawn(creep: Creep) {
    return creep.room.find(FIND_MY_SPAWNS)[0];
}


