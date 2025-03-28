  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::monster_hunter_monster_type {

  public enum MonsterType has copy, drop , store {
                                Caterpillar,Eagle,None,Rat
                        }

  public fun new_caterpillar(): MonsterType {
    MonsterType::Caterpillar
  }

  public fun new_eagle(): MonsterType {
    MonsterType::Eagle
  }

  public fun new_none(): MonsterType {
    MonsterType::None
  }

  public fun new_rat(): MonsterType {
    MonsterType::Rat
  }
}
