  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::monster_hunter_errors {

  #[error]

  const CANNOT_MOVE: vector<u8> = b"This entity cannot move";

  public fun cannot_move_error(condition: bool) {
    assert!(condition, CANNOT_MOVE)
  }

  #[error]

  const ALREADY_REGISTERED: vector<u8> = b"This address is already registered";

  public fun already_registered_error(condition: bool) {
    assert!(condition, ALREADY_REGISTERED)
  }

  #[error]

  const SPACE_OBSTRUCTED: vector<u8> = b"This space is obstructed";

  public fun space_obstructed_error(condition: bool) {
    assert!(condition, SPACE_OBSTRUCTED)
  }

  #[error]

  const IN_ENCOUNTER: vector<u8> = b"This player is already in an encounter";

  public fun in_encounter_error(condition: bool) {
    assert!(condition, IN_ENCOUNTER)
  }

  #[error]

  const NOT_IN_ENCOUNTER: vector<u8> = b"This player is not in an encounter";

  public fun not_in_encounter_error(condition: bool) {
    assert!(condition, NOT_IN_ENCOUNTER)
  }
}
