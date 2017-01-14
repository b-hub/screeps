function endTempRole(creep) {
    creep.memory.tempRole = false;
    creep.memory.sourceFlag = undefined;
    creep.memory.targetFlag = undefined;
}

/** @param {Creep} creep **/
function run(creep) {
    var sourceRoom = (creep.memory.sourceFlag)
        ? Game.flags[creep.memory.sourceFlag].room
        : creep.room;

    var targetRoom = (creep.memory.targetFlag)
        ? Game.flags[creep.memory.targetFlag].room
        : creep.room;

    if(creep.carry.energy < creep.carryCapacity) {
        if (creep.memory.targetFlag && !targetRoom) {
            creep.moveTo(Game.flags[creep.memory.targetFlag]);

        } else {
            var source = targetRoom.find(FIND_SOURCES)[0];

            if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }

    } else if (creep.memory.sourceFlag && !sourceRoom) {
        creep.moveTo(Game.flags[creep.memory.targetFlag]);

    } else {

        var targets = sourceRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
        });

        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            } else if (creep.memory.tempRole) {
                endTempRole(creep);
            }
        } else {
            targets = sourceRoom.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
                }
            });

            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                } else if (creep.memory.tempRole) {
                    endTempRole(creep);
                }
            }
        }
    }
}

module.exports = {
    run: run
};
