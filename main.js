var config = require('config');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRunner = require('role.runner');
var roleEHarvester = require('role.eHarvester');
var roleERunner = require('role.eRunner');
var roleReserver = require('role.reserver');
var roleGuard = require('role.guard');

function notError(val) {
    return typeof(val) === 'string';
}

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var tHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'travelling harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var runners = _.filter(Game.creeps, (creep) => creep.memory.role == 'runner');
    
    if (Object.keys(Game.creeps).length == 0) {
        Game.spawns['Origin'].createCreep([WORK,CARRY,MOVE], "reviver", {role: 'runner'});
    }

    for (i in config.sources) {
        var source = config.sources[i];
        if (_.filter(Game.creeps, (creep) => creep.memory.role == 'eHarvester' && creep.memory.sourceId == source.id).length < 1) {
            var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE], undefined, {role: 'eHarvester', sourceFlag: source.flagName, sourceId: source.id});
            if (notError(newName)) console.log('Spawning new eHarvester: ' + newName + ' - ' + source.id)
        }
        if (Memory.outContainers[source.id] && _.filter(Game.creeps, (creep) => creep.memory.role == 'eRunner' && creep.memory.withdrawTargetId == Memory.outContainers[source.id]).length < 1) {
            var newName = Game.spawns['Origin'].createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'eRunner', sourceFlag: 'Controller1', targetFlag: source.flagName, withdrawTargetId: Memory.outContainers[source.id]});
            if (notError(newName)) console.log('Spawning new eRunner: ' + newName + ' - ' + source.id)
        }
    }

    if(harvesters.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE], undefined, {role: 'harvester'});
        if (notError(newName)) console.log('Spawning new harvester: ' + newName);

    } else if (runners.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'runner'});
        if (notError(newName)) console.log('Spawning new runner: ' + newName);

    } else if (builders.length < 5) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
        if (notError(newName)) console.log('Spawning new builder: ' + newName);

    } else if (upgraders.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        if (notError(newName)) console.log('Spawning new upgrader: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role == 'reserver').length < 1) {
        var newName = Game.spawns['Origin'].createCreep([CLAIM,MOVE], undefined, {role: 'reserver', targetFlag: 'Controller2'});
        if (notError(newName)) console.log('Spawning new reserver: ' + newName);
    } else if (_.filter(Game.creeps, (creep) => creep.memory.role === 'guard').length < 2) {
        var newName = Game.spawns['Origin'].createCreep([ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,TOUGH,MOVE], undefined, {role: 'guard', postFlag: 'Post1'});
        if (notError(newName)) console.log('Spawning new guard: ' + newName);
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
        }
    }
}
