function run(creep) {
    if (!creep) return;

    var post = Game.flags[creep.memory.postFlag];
    
    if (post && !post.room) {
        creep.moveTo(post);
        return;
    }
    
    var rampart = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: (s) =>  {
            return s.structureType === STRUCTURE_RAMPART;
        }
    });
    
    if (rampart) {
        creep.say("rampart");
        if (creep.attack(rampart) == ERR_NOT_IN_RANGE) {
            creep.moveTo(rampart);   
        }
        return;
    }
    
    var towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
        filter: (s) =>  {
            return s.structureType === STRUCTURE_TOWER;
        }
    });
    
    if (towers.length) {
        creep.say("tower");
        if (creep.attack(towers[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(towers[0]);   
        }
        return;
    }
                
    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    if (target) {
        var targetName = (target.owner) ? target.owner.username : "NPC";
        creep.say(targetName);
        var errorCode = creep.attack(target);
        if(errorCode == ERR_NOT_IN_RANGE && target.room.name === post.room.name) {
            creep.moveTo(target);
        }
        return;
    }
    
    var spawns = creep.room.find(FIND_HOSTILE_SPAWNS);
    
    if (spawns.length) {
        creep.say("spawn");
        if (creep.attack(spawns[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawns[0]);   
        }
        return;
    }
    
    var anything = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: (s) => {
            return s.structureType !== STRUCTURE_CONTROLLER;
        }
    });

    if (anything) {
        creep.say("anything");
        if (creep.attack(anything) == ERR_NOT_IN_RANGE) {
            creep.moveTo(anything);   
        }
        return;
    }

    creep.moveTo(post);
}

module.exports = {
    run: run
};
