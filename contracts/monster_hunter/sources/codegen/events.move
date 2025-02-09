  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::events {

  use std::ascii::{String, string};

  use monster_hunter::monster_type::MonsterType;

  use monster_hunter::direction::Direction;

  use monster_hunter::terrain_type::TerrainType;

  use monster_hunter::monster_catch_result::MonsterCatchResult;

  use monster_hunter::map_config::MapConfig;

  use monster_hunter::position::Position;

  use monster_hunter::encounter_info::EncounterInfo;

  use monster_hunter::monster_catch_attempt_event::MonsterCatchAttemptEvent;

  use monster_hunter::monster_catch_attempt_event;

  public fun monster_catch_attempt_event(player: address, monster: address, result: MonsterCatchResult) {
    dubhe::storage_event::emit_set_record<MonsterCatchAttemptEvent, MonsterCatchAttemptEvent, MonsterCatchAttemptEvent>(
				string(b"monster_catch_attempt_event"),
				option::none(),
			  	option::none(),
			  option::some(monster_catch_attempt_event::new(player,monster,result))
			  )
  }
}
