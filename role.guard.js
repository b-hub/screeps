function run(creep) {
    if (!creep) return;

    var post = Game.flags[creep.memory.postFlag];
    
    if (!post.room) {
        creep.moveTo(post);
        return;
    }
                
    var enemies = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: (c) => {
            return !c.owner || c.owner.username !== 'wiggydave10';
        }
    });

    if (enemies.length) {
        var target = enemies[0];
        var targetName = (target.owner) ? target.owner.username : "NPC";
        creep.say(targetName);
        var errorCode = creep.attack(target);
        if(errorCode == ERR_NOT_IN_RANGE && target.room.name === post.room.name) {
            creep.moveTo(target);
            return;
        }
    }

    creep.moveTo(post);
}

module.exports = {
    run: run
};
