/** @param {Creep} creep **/
function run(creep) {
    if (!creep) return;


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
        var flag = Game.flags[creep.memory.postFlag];
        if (flag) {
            if (!flag.room || creep.room.name != flag.room.name) {
                creep.moveTo(flag);
                return;
            }
        }

        
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
      var sources = creep.room.find(FIND_STRUCTURES, {
              filter: (structure) => {
                  return (structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0;
              }
      });

      if (!sources.length) {
        sources = [creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > creep.carryCapacity;
                }
        })];
      }
      if (sources.length && sources[0]) {
          if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              creep.moveTo(sources[0]);
          }
      } else {
          console.log("here!");
           sources = creep.room.find(FIND_SOURCES);
           if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
               creep.moveTo(sources[0]);
           }
      }
    }
}

module.exports = {
    run: run
};
