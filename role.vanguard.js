function run(creep) {
    if (!creep) return;

    var post = Game.flags[creep.memory.postFlag];
    
    creep.moveTo(post);
}

module.exports = {
    run: run
};
