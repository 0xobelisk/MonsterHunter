import { DubheConfig, storage } from '@0xobelisk/sui-common';

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
    cannot_move: 'This entity cannot move',
    already_registered: 'This address is already registered',
    space_obstructed: 'This space is obstructed',
    in_encounter: 'This player is already in an encounter',
    not_in_encounter: 'This player is not in an encounter',
  },
  events: {
    monster_catch_attempt: {
      player: 'address',
      monster: 'address',
      result: 'MonsterCatchResult',
    },
  },
  schemas: {
    player: storage('address', 'bool'),
    moveable: storage('address', 'bool'),
    position: storage('address', 'Position'),
    obstruction: storage('Position', 'bool'),
    map_config: storage('MapConfig'),
    encounterable: storage('address', 'bool'),
    encounter_trigger: storage('Position', 'bool'),
    encounter: storage('address', 'EncounterInfo'),
    monster: storage('address', 'MonsterType'),
    owned_by: storage('address', 'address'),
  },
} as DubheConfig;