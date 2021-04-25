function run(tower) {
    var healTargets = tower.room.find(FIND_MY_CREEPS, {
       filter: (creep) => {
           return creep.hits < creep.hitsMax;
       }
    });
    
    if (healTargets.length) {
        tower.heal(healTargets[0]);
    }
    
    var enemies = tower.room.find(FIND_HOSTILE_CREEPS);
    
    if (enemies.length) {
        tower.attack(enemies[0]);
    }
    
    var repairTargets = tower.room.find(FIND_STRUCTURES, {
       filter: (structure) => {
           return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 50000;
       } 
    });
    
    if (repairTargets.length) {
        tower.repair(repairTargets[0]);
    }
}

module.exports = {
    run: run
};