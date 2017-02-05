function main(creep) {
    if (!creep.memory.lastHits) {
        creep.memory.lastHits = creep.hits;
    }
    run(creep);
    
    creep.memory.lastHits = creep.hits;
}
function takingDamage(creep) {
    return creep.memory.lastHits > creep.hits;
}

function protectiveLayerCount(creep) {
    return _.filter(creep.body, (b) => b.type === TOUGH && c.hits == 100).length;
}

function run (creep) {
    if (!creep) return;
    
    if (creep.hits < creep.hitsMax) {
        creep.heal(creep);
    
        if (takingDamage(creep) && protectiveLayerCount(creep) <= 1) {
            creep.moveTo(Game.flags['Home']);
            return;
        }
    }
    
    var damaged = creep.room.find(FIND_MY_CREEPS, {
       filter: (c) => {
           return c.hits < c.hitsMax && c.id !== creep.id;
       } 
    });
    
    if (damaged.length) {
        var err = creep.heal(damaged[0]);
        if (err == ERR_NOT_IN_RANGE) {
            creep.moveTo(damaged[0]);
            return;
        }
    }
    
    var post = Game.flags[creep.memory.postFlag];
    
    if (creep.hits === creep.hitsMax) {
        creep.moveTo(post);
    }

}

module.exports = {
    run: run
};