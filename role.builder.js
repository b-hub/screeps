function firstOrDefault(arr) {
    return (arr.length) ? arr[0] : null;
}

/** @param {Creep} creep **/
function run(creep) {

    if(creep.memory.building && creep.carry.energy == 0) {
        creep.memory.building = false;
        creep.say('harvesting');
    }
    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
        creep.memory.building = true;
        creep.say('building');
    }

    if(creep.memory.building) {
        var buildTarget = Game.getObjectById(creep.memory.buildTarget);
        var buildJob = (buildTarget)
            ? buildTarget
            : firstOrDefault([].concat.apply([], Object.keys(Game.rooms)
                .map(function(e){return Game.rooms[e].find(FIND_CONSTRUCTION_SITES);})));
        var repairLimit = (buildJob) ? 0.7 : 0.9;
        if (buildTarget) repairLimit = 0.3;

        var targets = creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) && (structure.hits / structure.hitsMax < repairLimit);
            }
        });

        if(targets.length) {
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            if (buildJob) {
                if(creep.build(buildJob) == ERR_NOT_IN_RANGE) {
                    creep.memory.buildTarget = buildJob.id;
                    creep.moveTo(buildJob);
                } else {
                    creep.memory.buildTarget = undefined;
                }
            }
        }
    } else {
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
            // sources = creep.room.find(FIND_SOURCES);
            // if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(sources[0]);
            // }
        }
    }
}

module.exports = {
    run: run
};
