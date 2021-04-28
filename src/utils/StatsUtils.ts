export function saveStats() {
    Memory.stats = Memory.stats || {};

    Memory.stats.cpuLimit = Game.cpu.limit;
    Memory.stats.gclProgress = Game.gcl.progress;
}
