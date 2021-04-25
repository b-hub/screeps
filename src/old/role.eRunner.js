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
            : creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER)
                    && structure.energyCapacity - structure.energy > creep.carry.energy;
                }
            })[0];
            
        if (!target) {
            target = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE)
                    && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            })[0];
        }

        if (!target) {
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                }
            });
        }

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
        
        var repairTargets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
            filter: (s) => {
                return s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax;
            }
        });
        
        if (repairTargets.length) {
            creep.repair(repairTargets[0]);
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
