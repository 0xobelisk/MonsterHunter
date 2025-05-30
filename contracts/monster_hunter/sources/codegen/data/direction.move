  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::monster_hunter_direction {

  public enum Direction has copy, drop , store {
                                East,North,South,West
                        }

  public fun new_east(): Direction {
    Direction::East
  }

  public fun new_north(): Direction {
    Direction::North
  }

  public fun new_south(): Direction {
    Direction::South
  }

  public fun new_west(): Direction {
    Direction::West
  }
}
