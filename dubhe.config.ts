import { DubheConfig } from '@0xobelisk/sui-common';

export const dubheConfig = {
  name: 'monster_hunter',
  description: 'monster_hunter contract',
  data: {
    MonsterType: ['None', 'Eagle', 'Rat', 'Caterpillar'],
    Direction: ['North', 'East', 'South', 'West'],
    TerrainType: ['None', 'TallGrass', 'Boulder'],
    MonsterCatchResult: ['Missed', 'Caught', 'Fled'],
    MapConfig: { width: 'u64', height: 'u64', terrain: 'vector<vector<TerrainType>>' },
    Position: { x: 'u64', y: 'u64' },
    EncounterInfo: { monster: 'address', catch_attempts: 'u64' },
  },
  errors: {
    CannotMove: 'This entity cannot move',
    AlreadyRegistered: 'This address is already registered',
    SpaceObstructed: 'This space is obstructed',
    InEncounter: 'This player is already in an encounter',
    NotInEncounter: 'This player is not in an encounter',
  },
  events: {
    MonsterCatchAttempt: {
      player: 'address',
      monster: 'address',
      result: 'MonsterCatchResult',
    },
  },
  schemas: {
    player: 'StorageMap<address, bool>',
    moveable: 'StorageMap<address, bool>',
    position: 'StorageMap<address, Position>',
    obstruction: 'StorageMap<Position, bool>',
    map_config: 'StorageValue<MapConfig>',
    encounterable: 'StorageMap<address, bool>',
    encounter_trigger: 'StorageMap<Position, bool>',
    encounter: 'StorageMap<address, EncounterInfo>',
    monster: 'StorageMap<address, MonsterType>',
    owned_by: 'StorageMap<address, address>',
  },
} as DubheConfig;