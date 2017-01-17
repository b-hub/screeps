function run(creep) {
    var post = Game.flags[creep.memory.postFlag];
    var enemies = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: function(object) {
            return object.getActiveBodyparts(ATTACK) == 0;
        }
    });
    
    if (enemies.length) {
        var target = enemies[0];
        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        return;
    }
    
    if (creep.room.name !== post.room.name) {
        creep.moveTo(post.room);
        return;
    }
    
    creep.moveTo(post);
}

module.exports = {
    run: run
};