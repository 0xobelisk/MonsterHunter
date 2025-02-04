  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::schema {

  use std::ascii::String;

  use std::ascii::string;

  use sui::package::UpgradeCap;

  use std::type_name;

  use dubhe::storage;

  use dubhe::storage_value::{Self, StorageValue};

  use dubhe::storage_map::{Self, StorageMap};

  use dubhe::storage_double_map::{Self, StorageDoubleMap};

  use sui::dynamic_field as df;

  use monster_hunter::monster_type::MonsterType;

  use monster_hunter::direction::Direction;

  use monster_hunter::terrain_type::TerrainType;

  use monster_hunter::monster_catch_result::MonsterCatchResult;

  use monster_hunter::map_config::MapConfig;

  use monster_hunter::position::Position;

  use monster_hunter::monster_info::MonsterInfo;

  public struct Schema has key, store {
    id: UID,
  }

  public fun borrow_player(self: &Schema): &StorageMap<address, bool> {
    storage::borrow_field(&self.id, b"player")
  }

  public(package) fun player(self: &mut Schema): &mut StorageMap<address, bool> {
    storage::borrow_mut_field(&mut self.id, b"player")
  }

  public fun borrow_encounterable(self: &Schema): &StorageMap<address, bool> {
    storage::borrow_field(&self.id, b"encounterable")
  }

  public(package) fun encounterable(self: &mut Schema): &mut StorageMap<address, bool> {
    storage::borrow_mut_field(&mut self.id, b"encounterable")
  }

  public fun borrow_moveable(self: &Schema): &StorageMap<address, bool> {
    storage::borrow_field(&self.id, b"moveable")
  }

  public(package) fun moveable(self: &mut Schema): &mut StorageMap<address, bool> {
    storage::borrow_mut_field(&mut self.id, b"moveable")
  }

  public fun borrow_obstruction(self: &Schema): &StorageMap<address, bool> {
    storage::borrow_field(&self.id, b"obstruction")
  }

  public(package) fun obstruction(self: &mut Schema): &mut StorageMap<address, bool> {
    storage::borrow_mut_field(&mut self.id, b"obstruction")
  }

  public fun borrow_encounter_trigger(self: &Schema): &StorageMap<address, bool> {
    storage::borrow_field(&self.id, b"encounter_trigger")
  }

  public(package) fun encounter_trigger(self: &mut Schema): &mut StorageMap<address, bool> {
    storage::borrow_mut_field(&mut self.id, b"encounter_trigger")
  }

  public fun borrow_monster(self: &Schema): &StorageMap<address, MonsterType> {
    storage::borrow_field(&self.id, b"monster")
  }

  public(package) fun monster(self: &mut Schema): &mut StorageMap<address, MonsterType> {
    storage::borrow_mut_field(&mut self.id, b"monster")
  }

  public fun borrow_owned_by(self: &Schema): &StorageMap<address, address> {
    storage::borrow_field(&self.id, b"owned_by")
  }

  public(package) fun owned_by(self: &mut Schema): &mut StorageMap<address, address> {
    storage::borrow_mut_field(&mut self.id, b"owned_by")
  }

  public fun borrow_map_config(self: &Schema): &StorageValue<MapConfig> {
    storage::borrow_field(&self.id, b"map_config")
  }

  public(package) fun map_config(self: &mut Schema): &mut StorageValue<MapConfig> {
    storage::borrow_mut_field(&mut self.id, b"map_config")
  }

  public fun borrow_position(self: &Schema): &StorageMap<address, Position> {
    storage::borrow_field(&self.id, b"position")
  }

  public(package) fun position(self: &mut Schema): &mut StorageMap<address, Position> {
    storage::borrow_mut_field(&mut self.id, b"position")
  }

  public fun borrow_monster_info(self: &Schema): &StorageMap<address, MonsterInfo> {
    storage::borrow_field(&self.id, b"monster_info")
  }

  public(package) fun monster_info(self: &mut Schema): &mut StorageMap<address, MonsterInfo> {
    storage::borrow_mut_field(&mut self.id, b"monster_info")
  }

  public(package) fun create(ctx: &mut TxContext): Schema {
    let mut id = object::new(ctx);
    storage::add_field<StorageMap<address, bool>>(&mut id, b"player", storage_map::new(b"player", ctx));
    storage::add_field<StorageMap<address, bool>>(&mut id, b"encounterable", storage_map::new(b"encounterable", ctx));
    storage::add_field<StorageMap<address, bool>>(&mut id, b"moveable", storage_map::new(b"moveable", ctx));
    storage::add_field<StorageMap<address, bool>>(&mut id, b"obstruction", storage_map::new(b"obstruction", ctx));
    storage::add_field<StorageMap<address, bool>>(&mut id, b"encounter_trigger", storage_map::new(b"encounter_trigger", ctx));
    storage::add_field<StorageMap<address, MonsterType>>(&mut id, b"monster", storage_map::new(b"monster", ctx));
    storage::add_field<StorageMap<address, address>>(&mut id, b"owned_by", storage_map::new(b"owned_by", ctx));
    storage::add_field<StorageValue<MapConfig>>(&mut id, b"map_config", storage_value::new(b"map_config", ctx));
    storage::add_field<StorageMap<address, Position>>(&mut id, b"position", storage_map::new(b"position", ctx));
    storage::add_field<StorageMap<address, MonsterInfo>>(&mut id, b"monster_info", storage_map::new(b"monster_info", ctx));
    Schema { id }
  }

  public fun migrate(_schema: &mut Schema, _cap: &UpgradeCap, _ctx: &mut TxContext) {}

  // ======================================== View Functions ========================================

  public fun get_player(self: &Schema, key: address): &bool {
    self.borrow_player().get(key)
  }

  public fun get_encounterable(self: &Schema, key: address): &bool {
    self.borrow_encounterable().get(key)
  }

  public fun get_moveable(self: &Schema, key: address): &bool {
    self.borrow_moveable().get(key)
  }

  public fun get_obstruction(self: &Schema, key: address): &bool {
    self.borrow_obstruction().get(key)
  }

  public fun get_encounter_trigger(self: &Schema, key: address): &bool {
    self.borrow_encounter_trigger().get(key)
  }

  public fun get_monster(self: &Schema, key: address): &MonsterType {
    self.borrow_monster().get(key)
  }

  public fun get_owned_by(self: &Schema, key: address): &address {
    self.borrow_owned_by().get(key)
  }

  public fun get_map_config(self: &Schema): &MapConfig {
    self.borrow_map_config().get()
  }

  public fun get_position(self: &Schema, key: address): &Position {
    self.borrow_position().get(key)
  }

  public fun get_monster_info(self: &Schema, key: address): &MonsterInfo {
    self.borrow_monster_info().get(key)
  }

  // =========================================================================================================
}
