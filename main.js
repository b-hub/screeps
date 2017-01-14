var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRunner = require('role.runner');
var roleEHarvester = require('role.eHarvester');

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

    if (_.filter(Game.creeps, (creep) => creep.memory.role == 'eHarvester').length < 1) {
         Game.spawns['Origin'].createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'eHarvester', sourceFlag: 'Controller2', sourceId: '5873bde111e3e4361b4d9f2a'});
    } else if(harvesters.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE], undefined, {role: 'harvester'});
        if (notError(newName)) console.log('Spawning new harvester: ' + newName);

    } else if (runners.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'runner'});
        if (notError(newName)) console.log('Spawning new runner: ' + newName);

    } else if (builders.length < 3) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'builder'});
        if (notError(newName)) console.log('Spawning new builder: ' + newName);

    } else if (upgraders.length < 2) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
        if (notError(newName)) console.log('Spawning new upgrader: ' + newName);
    } else if (tHarvesters.length < 2) {
        var newName = Game.spawns['Origin'].createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'travelling harvester', sourceFlag: 'Controller1', targetFlag: 'Controller2'});
        if (notError(newName)) console.log('Spawning new travelling harvester: ' + newName);
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
        }
    }
}
