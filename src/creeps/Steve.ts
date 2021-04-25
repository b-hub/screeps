interface SteveMemory extends CreepMemory {
    state: SteveState
}

export enum SteveState {
    harvesting,
    upgrading,
}

export class Steve {

    public static run(creep: Creep) {
        var memory = creep.memory as SteveMemory;

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
                } else {
                    memory.state = upgrade(creep, controller);
                }
                break;
        }
    }
}

function harvest(creep: Creep, source: Source): SteveState {
    var result = creep.harvest(source);
    if(result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }

    if (creep.store.getFreeCapacity() === 0) {
        creep.say("upgrading");
        return SteveState.upgrading;
    }

    return SteveState.harvesting;
}

function upgrade(creep: Creep, controller: StructureController): SteveState {
    var result = creep.upgradeController(controller) ;

    if(result === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
    }

    if (creep.store.getUsedCapacity() === 0){
        creep.say("harvesting");
        return SteveState.harvesting;
    }

    return SteveState.upgrading;
}

function getClosestSource(creep: Creep) {
    return creep.room.find(FIND_SOURCES)[0];
}

function getClosestSpawn(creep: Creep) {
    return creep.room.find(FIND_MY_SPAWNS)[0];
}


