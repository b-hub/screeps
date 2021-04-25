
function run(creep) {
    if (!creep) return;
    
    var targetFlag = Game.flags[creep.memory.targetFlag];
    
    if (!targetFlag.room || creep.room.name !== targetFlag.room.name) {
        creep.moveTo(targetFlag);
        return;
    }
    
    if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {reusePath: 5});
    }

}

module.exports = {
    run: run
};