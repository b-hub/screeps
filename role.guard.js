function run(creep) {

    var post = Game.flags[creep.memory.postFlag];
    var enemies = [].concat.apply([], Object.keys(Game.rooms)
                .map(function(e){return Game.rooms[e].find(FIND_HOSTILE_CREEPS);}));
                
    console.log(enemies);
    
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