  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::monster_hunter_position {

  use sui::bcs::{to_bytes};

  use dubhe::table_id;

  use dubhe::dapp_state;

  use dubhe::dapp_service;

  use dubhe::dapp_hub;

  use dubhe::dapp_hub::DappHub;

  use monster_hunter::monster_hunter_dapp_key;

  use monster_hunter::monster_hunter_dapp_key::DappKey;

  const TABLE_NAME: vector<u8> = b"position";

  public struct Position has copy, drop, store {
    x: u64,
    y: u64,
  }

  public fun new(x: u64, y: u64): Position {
    Position {
            x,
            y,
        }
  }

  public fun x(self: &Position): u64 {
    self.x
  }

  public fun y(self: &Position): u64 {
    self.y
  }

  public fun update_x(self: &mut Position, x: u64) {
    self.x = x
  }

  public fun update_y(self: &mut Position, y: u64) {
    self.y = y
  }

  public fun get_table_id(): vector<u8> {
    table_id::encode(table_id::onchain_table_type(), TABLE_NAME)
  }

  public fun get_key_schemas(): vector<vector<u8>> {
    vector[b"address"]
  }

  public fun get_value_schemas(): vector<vector<u8>> {
    vector[b"u64", b"u64"]
  }

  public fun get_key_names(): vector<vector<u8>> {
    vector[b"id"]
  }

  public fun get_value_names(): vector<vector<u8>> {
    vector[b"x", b"y"]
  }

  public fun register_table(dapp_hub: &mut DappHub, ctx: &mut TxContext) {
    let dapp_key = monster_hunter_dapp_key::new();
    dapp_service::register_table(
            dapp_hub, 
            dapp_key,
            get_table_id(), 
            TABLE_NAME, 
            get_key_schemas(), 
            get_key_names(), 
            get_value_schemas(), 
            get_value_names(), 
            ctx
        );
  }

  public fun has(dapp_hub: &DappHub, id: address): bool {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::has_record<DappKey>(dapp_hub, get_table_id(), key_tuple)
  }

  public fun ensure_has(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_has_record<DappKey>(dapp_hub, get_table_id(), key_tuple)
  }

  public fun ensure_not_has(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_not_has_record<DappKey>(dapp_hub, get_table_id(), key_tuple)
  }

  public fun has_x(dapp_hub: &DappHub, id: address): bool {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 0)
  }

  public fun ensure_has_x(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 0)
  }

  public fun ensure_not_has_x(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_not_has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 0)
  }

  public fun has_y(dapp_hub: &DappHub, id: address): bool {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 1)
  }

  public fun ensure_has_y(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 1)
  }

  public fun ensure_not_has_y(dapp_hub: &DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::ensure_not_has_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 1)
  }

  public fun delete(dapp_hub: &mut DappHub, id: address) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    dapp_service::delete_record<DappKey>(dapp_hub, monster_hunter_dapp_key::new(), get_table_id(), key_tuple);
  }

  public fun get_x(dapp_hub: &DappHub, id: address): u64 {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value = dapp_service::get_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 0);
    let mut bsc_type = sui::bcs::new(value);
    let x = sui::bcs::peel_u64(&mut bsc_type);
    x
  }

  public fun set_x(dapp_hub: &mut DappHub, id: address, x: u64) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value = to_bytes(&x);
    dapp_service::set_field(dapp_hub, monster_hunter_dapp_key::new(), get_table_id(), key_tuple, 0, value);
  }

  public fun get_y(dapp_hub: &DappHub, id: address): u64 {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value = dapp_service::get_field<DappKey>(dapp_hub, get_table_id(), key_tuple, 1);
    let mut bsc_type = sui::bcs::new(value);
    let y = sui::bcs::peel_u64(&mut bsc_type);
    y
  }

  public fun set_y(dapp_hub: &mut DappHub, id: address, y: u64) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value = to_bytes(&y);
    dapp_service::set_field(dapp_hub, monster_hunter_dapp_key::new(), get_table_id(), key_tuple, 1, value);
  }

  public fun get(dapp_hub: &DappHub, id: address): (u64, u64) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value_tuple = dapp_service::get_record<DappKey>(dapp_hub, get_table_id(), key_tuple);
    let mut bsc_type = sui::bcs::new(value_tuple);
    let x = sui::bcs::peel_u64(&mut bsc_type);
    let y = sui::bcs::peel_u64(&mut bsc_type);
    (x, y)
  }

  public fun set(dapp_hub: &mut DappHub, id: address, x: u64, y: u64) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value_tuple = encode(x, y);
    dapp_service::set_record(dapp_hub, monster_hunter_dapp_key::new(), get_table_id(), key_tuple, value_tuple);
  }

  public fun get_struct(dapp_hub: &DappHub, id: address): Position {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value_tuple = dapp_service::get_record<DappKey>(dapp_hub, get_table_id(), key_tuple);
    decode(value_tuple)
  }

  public fun set_struct(dapp_hub: &mut DappHub, id: address, position: Position) {
    let mut key_tuple = vector::empty();
    key_tuple.push_back(to_bytes(&id));
    let value_tuple = encode_struct(position);
    dapp_service::set_record(dapp_hub, monster_hunter_dapp_key::new(), get_table_id(), key_tuple, value_tuple);
  }

  public fun encode(x: u64, y: u64): vector<vector<u8>> {
    let mut value_tuple = vector::empty();
    value_tuple.push_back(to_bytes(&x));
    value_tuple.push_back(to_bytes(&y));
    value_tuple
  }

  public fun encode_struct(position: Position): vector<vector<u8>> {
    encode(position.x, position.y)
  }

  public fun decode(data: vector<u8>): Position {
    let mut bsc_type = sui::bcs::new(data);
    let x = sui::bcs::peel_u64(&mut bsc_type);
    let y = sui::bcs::peel_u64(&mut bsc_type);
    Position {
            x,
            y,
        }
  }
}
