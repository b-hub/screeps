function firstOrDefault(arr) {
    return (arr.length) ? arr[0] : null;
}

function build(creep, target) {
    if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
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
        
        if (!buildTarget) {
            creep.memory.buildTarget = undefined;
        }
        
        var buildJob = (buildTarget)
            ? buildTarget
            : firstOrDefault([].concat.apply([], Object.keys(Game.rooms)
                .map(function(e){return Game.rooms[e].find(FIND_CONSTRUCTION_SITES);})));
                
        var repairLimit = (buildJob) ? 0.7 : 1;
        if (buildTarget) {
            repairLimit = 0.3;
        }

        var targets = creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType !== STRUCTURE_WALL && structure.structureType !== STRUCTURE_RAMPART && structure.hits / structure.hitsMax < repairLimit;
            }
        });

        if(targets.length && !buildJob) {
            if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            if (buildJob) {
                creep.memory.buildTarget = buildJob.id;
                build(creep, buildJob);
            }
        }
    } else {
        var sources = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
                     && structure.store[RESOURCE_ENERGY] > 0;
            }
        });
        
        if (!sources.length) {
            sources = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                         && structure.store[RESOURCE_ENERGY] > 0;
                }
            });   
        }
        
        if (sources.length) {
            if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        } else {
            sources = creep.room.find(FIND_SOURCES);
            var err = creep.harvest(sources[0]);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }
}

module.exports = {
    run: run
};
