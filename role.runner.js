/** @param {Creep} creep **/
function run(creep) {
    if (creep.memory.running && creep.carry.energy == 0) {
        creep.memory.running = false;
    }
    
    if (!creep.memory.running && creep.carry.energy == creep.carryCapacity) {
        creep.memory.running = true;
    }
    
    if (creep.memory.running) {
        var target = (creep.memory.moveToTarget) ? Game.getObjectById(creep.memory.moveToTarget) : creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity;
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
            creep.memory.tempRole = 'upgrader';
        }
    
        
    } else {
        var sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > creep.carryCapacity;
                }
        });
        if (sources.length) {
            if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
        if (!sources.length) {
            creep.say("travelling");
            creep.memory.tempRole = 'travelling harvester'
            creep.memory.targetFlag = 'Controller2';
            creep.memory.sourceFlag = 'Controller1';
        }
        
    }
}

module.exports = {
  run: run
};
