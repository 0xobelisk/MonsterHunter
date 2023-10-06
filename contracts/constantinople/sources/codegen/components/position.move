module constantinople::position_comp {
    use std::ascii::{String, string};
    use std::option::{some, none};
    use sui::tx_context::TxContext;
    use sui::table::{Self, Table};
    use sui::table_vec::{Self, TableVec};
    use constantinople::entity_key;
    use constantinople::events;
    use constantinople::world::{Self, World};
  
    // Systems
	friend constantinople::rpg_system;

	const NAME: vector<u8> = b"position";

	// x
	// y
	struct PositionData has copy , drop, store {
		x: u64,
		y: u64
	}

	public fun new_data(x: u64, y: u64): PositionData {
		PositionData {
			x, 
			y
		}
	}


	struct CompMetadata has store {
		name: String,
		entity_key_to_index: Table<address, u64>,
		entities: TableVec<address>,
		data: Table<address, PositionData>
	}

	public fun new(ctx: &mut TxContext): CompMetadata {
		CompMetadata {
			name: name(),
			entity_key_to_index: table::new<address, u64>(ctx),
			entities: table_vec::empty<address>(ctx),
			data: table::new<address, PositionData>(ctx)
		}
	}

	public fun id(): address {
		entity_key::from_bytes(NAME)
	}

	public fun name(): String {
		string(NAME)
	}

	public fun entities(world: &World): &TableVec<address> {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		&_obelisk_component.entities
	}

	public fun entity_length(world: &World): u64 {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		table_vec::length(&_obelisk_component.entities)
	}

	public fun data(world: &World): &Table<address, PositionData> {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		&_obelisk_component.data
	}

	public fun register(world: &mut World, ctx: &mut TxContext) {
		world::add_comp<CompMetadata>(world, NAME, new(ctx));
		events::emit_register(NAME, none<PositionData>());
	}

	public(friend) fun add(world: &mut World, key: address, x: u64, y: u64) {
		let _obelisk_component = world::get_mut_comp<CompMetadata>(world, id());
		table::add(&mut _obelisk_component.entity_key_to_index, key, table_vec::length(&_obelisk_component.entities));
		table_vec::push_back(&mut _obelisk_component.entities, key);
		table::add(&mut _obelisk_component.data, key, new_data(x, y));
		events::emit_set(id(), some(key), new_data(x, y))
	}

	public(friend) fun remove(world: &mut World, key: address) {
		let _obelisk_component = world::get_mut_comp<CompMetadata>(world, id());
		let index = table::remove(&mut _obelisk_component.entity_key_to_index, key);
		if(index == table_vec::length(&_obelisk_component.entities) - 1) {
			table_vec::pop_back(&mut _obelisk_component.entities);
		} else {
			let last_value = table_vec::pop_back(&mut _obelisk_component.entities);
			*table_vec::borrow_mut(&mut _obelisk_component.entities, index) = last_value;
		};
		table::remove(&mut _obelisk_component.data, key);
		events::emit_remove(id(), key)
	}

	public(friend) fun update(world: &mut World, key: address, x: u64, y: u64) {
		let _obelisk_component = world::get_mut_comp<CompMetadata>(world, id());
		*table::borrow_mut<address, PositionData>(&mut _obelisk_component.data, key) = new_data(x, y);
		events::emit_set(id(), some(key), new_data(x, y))
	}
	public(friend) fun update_x(world: &mut World, key: address, x: u64) {
		let _obelisk_component = world::get_mut_comp<CompMetadata>(world, id());
		let _obelisk_data = table::borrow_mut<address, PositionData>(&mut _obelisk_component.data, key);
		_obelisk_data.x = x;
		events::emit_set(id(), some(key), *_obelisk_data)
	}

	public(friend) fun update_y(world: &mut World, key: address, y: u64) {
		let _obelisk_component = world::get_mut_comp<CompMetadata>(world, id());
		let _obelisk_data = table::borrow_mut<address, PositionData>(&mut _obelisk_component.data, key);
		_obelisk_data.y = y;
		events::emit_set(id(), some(key), *_obelisk_data)
	}

	public fun get(world: &World ,key: address): (u64,u64) {
  		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		let _obelisk_data = table::borrow<address, PositionData>(&_obelisk_component.data, key);
		(
			_obelisk_data.x,
			_obelisk_data.y
		)
}

	public fun get_x(world: &World, key: address): u64 {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		let _obelisk_data = table::borrow<address, PositionData>(&_obelisk_component.data, key);
		_obelisk_data.x
	}

	public fun get_y(world: &World, key: address): u64 {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		let _obelisk_data = table::borrow<address, PositionData>(&_obelisk_component.data, key);
		_obelisk_data.y
	}

	public fun contains(world: &World, key: address): bool {
		let _obelisk_component = world::get_comp<CompMetadata>(world, id());
		table::contains<address, PositionData>(&_obelisk_component.data, key)
	}

}
