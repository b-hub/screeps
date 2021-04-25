var config = require('config');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRunner = require('role.runner');
var roleEHarvester = require('role.eHarvester');
var roleERunner = require('role.eRunner');
var roleReserver = require('role.reserver');
var roleGuard = require('role.guard');
var roleTower = require('role.tower');
var roleHealer = require('role.healer');
var roleAttacker = require('role.attacker');
var roleVanguard = require('role.vanguard');

function notError(val) {
    return typeof(val) === 'string';
}

function spawner(spawn) {
    if (_.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawn == 'Origin2').length < 3){
        //Game.spawns['Origin2'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder', spawn: 'Origin2'});
    }
    
    if (_.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.postFlag == 'Home2' && creep.ticksToLive > 100).length < 2) {
        Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'upgrader', postFlag: 'Home2'});
    }
    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var tHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'travelling harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.memory.spawn != 'Origin2');
    var runners = _.filter(Game.creeps, (creep) => creep.memory.role == 'runner');
    
    if (Object.keys(Game.creeps).length == 0) {
        Game.spawns['Origin'].createCreep([WORK,CARRY,MOVE], "reviver", {role: 'runner'});
    }

    for (i in config.sources) {
        var source = config.sources[i];
        if (_.filter(Game.creeps, (creep) => creep.memory.role == 'eHarvester' && creep.memory.sourceId == source.id).length < 1) {
            var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'eHarvester', sourceFlag: source.flagName, sourceId: source.id});
            if (notError(newName)) console.log('Spawning new eHarvester: ' + newName + ' - ' + source.id)
            break;
        }
        var outContainerId = Memory.outContainers[source.id];
        
        if (outContainerId && Game.getObjectById(outContainerId) && _.filter(Game.creeps, (creep) => creep.memory.role == 'eRunner' && creep.memory.withdrawTargetId == outContainerId).length < source.runnerLimit) {
            var newName = Game.spawns['Origin'].createCreep([WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'eRunner', sourceFlag: 'Controller1', targetFlag: source.flagName, withdrawTargetId: outContainerId});
            if (notError(newName)) console.log('Spawning new eRunner: ' + newName + ' - ' + source.id)
            break;
        }
    }

    if (runners.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'runner'});
        if (notError(newName)) console.log('Spawning new runner: ' + newName);

    } else if (builders.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'builder'});
        if (notError(newName)) console.log('Spawning new builder: ' + newName);

    } else if (_.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.postFlag != 'Home2' && creep.ticksToLive > 100).length < 2) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        if (notError(newName)) console.log('Spawning new upgrader: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role == 'reserver').length < 1) {
        var newName = Game.spawns['Origin'].createCreep([CLAIM,MOVE], undefined, {role: 'reserver', targetFlag: 'Controller2'});
        if (notError(newName)) console.log('Spawning new reserver: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role === 'guard' && creep.memory.postFlag == 'Post1').length < 1) {
        var newName = Game.spawns['Origin'].createCreep([TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK], undefined, {role: 'guard', postFlag: 'Post1'});
        if (notError(newName)) console.log('Spawning new guard: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role === 'guard' && creep.memory.postFlag == 'Home2' && creep.ticksToLive > 100).length < 0) {
        var newName = Game.spawns['Origin'].createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK], undefined, {role: 'guard', postFlag: 'Home2'});
        if (notError(newName)) console.log('Spawning new guard: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role === 'healer' && creep.memory.postFlag == 'Home2' && creep.ticksToLive > 100).length < 0) {
        var newName = Game.spawns['Origin'].createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL], undefined, {role: 'healer', postFlag: 'Home2'});
        if (notError(newName)) console.log('Spawning new healer: ' + newName);
    }
}

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    if (!config.spawnHalt) {
        for (var name in Game.spawns) {
            spawner(name);
        }
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var switchOn = creep.memory.role;
        if (creep.memory.tempRole) {
            switchOn = creep.memory.tempRole;
        }
        switch (switchOn) {
            case 'harvester':
            case 'travelling harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'runner':
                roleRunner.run(creep);
                break;
            case 'eHarvester':
                roleEHarvester.run(creep);
                break;
            case 'eRunner':
                roleERunner.run(creep);
                break;
            case 'reserver':
                roleReserver.run(creep);
                break;
            case 'guard':
                roleGuard.run(creep);
                break;
            case 'healer':
                roleHealer.run(creep);
                break;
            case 'attacker':
                roleAttacker.run(creep);
                break;
            case 'vanguard':
                roleVanguard.run(creep);
                break;
        }
    }
    
    var towers = [].concat.apply([], Object.keys(Game.rooms).map(function(e){
        return Game.rooms[e].find(FIND_MY_STRUCTURES, {
            filter: {structureType: STRUCTURE_TOWER}
        });
    }));
    
    towers.forEach(tower => roleTower.run(tower));
}
