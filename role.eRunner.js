/** @param {Creep} creep **/
function run(creep) {
    if (creep.memory.running && creep.carry.energy == 0) {
        creep.memory.running = false;
    }

    if (!creep.memory.running && creep.carry.energy == creep.carryCapacity) {
        creep.memory.running = true;
    }

    if (creep.memory.running) {
        var sourceRoom = Game.flags[creep.memory.sourceFlag].room;

        if (creep.room.name != sourceRoom.name) {
            creep.moveTo(Game.flags[creep.memory.sourceFlag]);
            return;
        }

        var target = (creep.memory.moveToTarget)
            ? Game.getObjectById(creep.memory.moveToTarget)
            : creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            });

        if(target) {
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.memory.moveToTarget = target.id;
                creep.moveTo(target);
            } else {
                creep.memory.moveToTarget = undefined;
            }
        } else {
            //creep.memory.tempRole = 'upgrader';
        }


    } else {
        var source = Game.getObjectById(creep.memory.withdrawTargetId);
        if (source) {
            if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        } else {
            creep.moveTo(Game.flags[creep.memory.targetFlag]);
        }
    }
}

module.exports = {
  run: run
};
