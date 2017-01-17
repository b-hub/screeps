function moveToSourceFlag(creep) {
    var sourceFlag = Game.flags[creep.memory.sourceFlag];
    // if (creep.moveTo(sourceFlag, {noPathFinding: true}) == ERR_NOT_FOUND) {
        creep.moveTo(sourceFlag, {reusePath: 5});
    // }
}

function addContainerToMemory(sourceId, containerId) {
    if (!Memory.outContainers) {
        Memory.outContainers = {};
    }
    if (!Memory.outContainers[containerId]) {
        Memory.outContainers[sourceId] = containerId;
    }
}

function harvest(creep) {
    creep.memory.action = "harvesting";
    var source = Game.getObjectById(creep.memory.sourceId);
    if (source) {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    } else {
        moveToSourceFlag(creep);
    }
}

function store(creep) {
    creep.memory.action = "storing";
    var container = Game.getObjectById(creep.memory.containerId);
    if (!container) {
        container = searchSourceForContainer(creep);
    }
    if (container) {
        creep.memory.containerId = container.id;
        addContainerToMemory(container.id);
        creep.memory.contructionSiteId = undefined;

        if (container.hits < container.hitsMax) {
            creep.repair(container);
        } else if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
        }
    } else {
        creep.say("building");
        build(creep);
    }
}

// prepare site
function build(creep) {
    creep.memory.action = "building";
    var buildSite = (creep.memory.constructionSiteId)
        ? Game.getObjectById(creep.memory.constructionSiteId)
        : searchSourceForConstructionsSite(creep);

    if (buildSite) {
        var code = creep.build(buildSite);
        if (code == ERR_NOT_IN_RANGE || code == ERR_INVALID_TARGET) {
            creep.moveTo(buildSite);
        }
        creep.memory.constructionSiteId = buildSite.id;
    } else {
        createContainer(creep);
    }
}

function createContainer(creep) {
    var constructPos = getIdealContainerPos(creep);
    creep.room.createConstructionSite(constructPos, STRUCTURE_CONTAINER);
    var site = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, constructPos)[0];
    creep.moveTo(site);
    creep.memory.constructionSiteId = site.id;
}

function searchSourceForConstructionsSite(creep) {
    var searchDistance = 3;
    var sourcePos = Game.getObjectById(creep.memory.sourceId).pos;
    var found = creep.room.lookForAtArea(LOOK_CONSTRUCTION_SITES,
                              sourcePos.y - searchDistance,
                              sourcePos.x - searchDistance,
                              sourcePos.y + searchDistance,
                              sourcePos.x + searchDistance, true);
    return (found.length) ? found[0].constructionSite : null;
}

function searchSourceForContainer(creep) {
    var searchDistance = 3;
    var sourcePos = Game.getObjectById(creep.memory.sourceId).pos;
    var found = _.filter(creep.room.lookForAtArea(LOOK_STRUCTURES,
                              sourcePos.y - searchDistance,
                              sourcePos.x - searchDistance,
                              sourcePos.y + searchDistance,
                              sourcePos.x + searchDistance, true),
                f => f.structure.structureType == STRUCTURE_CONTAINER);
    return (found.length) ? found[0].structure : null;
}

function getIdealContainerPos(creep) {
    return creep.pos;
}

/** @param {Creep} creep **/
function run(creep) {
    switch(creep.memory.action) {
        case 'harvesting':
            if (creep.carry.energy == creep.carryCapacity) {
                creep.say("storing");
                store(creep);
            } else {
                harvest(creep);
            }
            break;
        case 'building':
            if (creep.carry.energy == 0) {
                creep.say("harvesting");
                harvest(creep);
            } else {
                build(creep);
            }
            break;
        case 'storing':
            if (creep.carry.energy == 0) {
                creep.say("harvesting");
                harvest(creep);
            } else {
                store(creep);
            }
            break;
        default:
            creep.say("harvesting");
            harvest(creep);
    }
}

module.exports = {
    run: run
};
