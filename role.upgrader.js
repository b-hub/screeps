/** @param {Creep} creep **/
function run(creep) {
    
    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
        if (creep.memory.tempRole) {
            creep.say('reverting to ' + creep.role);
            creep.memory.tempRole = false;
        } else {
            creep.say('harvesting');
        }
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('upgrading');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
      var sources = creep.room.find(FIND_STRUCTURES, {
              filter: (structure) => {
                  return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 0;
              }
      });
      if (sources.length) {
          if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(sources[0]);
          }
      } else {
        //   sources = creep.room.find(FIND_SOURCES);
        //   if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        //       creep.moveTo(sources[0]);
        //   }
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
