#[allow(lint(public_random))]
module monster_hunter::map_system;
use sui::clock::Clock;
use monster_hunter::monster_hunter_schema::Schema;
use monster_hunter::monster_hunter_encounter_info;
use sui::address;
use monster_hunter::monster_hunter_direction;
use monster_hunter::monster_hunter_position;
use monster_hunter::monster_hunter_direction::Direction;
use monster_hunter::monster_hunter_errors::{cannot_move_error, space_obstructed_error, already_registered_error,
    in_encounter_error
};
use monster_hunter::monster_hunter_monster_type;

public fun register(schema: &mut Schema,  x: u64, y: u64, ctx: &mut TxContext) {
    let player = ctx.sender();
    already_registered_error(!schema.player().contains(player));
    // Constrain position to map size, wrapping around if necessary
    let (width, height, _) = schema.map_config()[].get();
    let x = (x + width) % width;
    let y = (y + height) % height;

    let position = monster_hunter_position::new(x, y);
    space_obstructed_error(!schema.obstruction().contains(position));

    schema.player().set(player, true);
    schema.moveable().set(player, true);
    schema.encounterable().set(player, true);
    schema.position().set(player, monster_hunter_position::new(x, y));
}


fun start_encounter(schema: &mut Schema, clock: &Clock, player: address) {
    // let monster = random::generate_u256(generator);
    let monster = sui::clock::timestamp_ms(clock) as u256;
    let mut monster_type =monster_hunter_monster_type::new_none();
    if (monster % 4 == 1) {
        monster_type =monster_hunter_monster_type::new_eagle();
    } else if (monster % 4 == 2) {
        monster_type =monster_hunter_monster_type::new_rat();
    } else if (monster % 4 == 3) {
        monster_type =monster_hunter_monster_type::new_caterpillar();
    };

    let monster = address::from_u256(monster);
    schema.monster().set(monster, monster_type);
    std::debug::print(&monster);
    std::debug::print(&monster_type);
    let encounter_info = monster_hunter_encounter_info::new(monster, 0);
    schema.encounter().set(player, encounter_info);
}

public fun move_position(schema: &mut Schema, clock: &Clock, direction: Direction, ctx: &mut TxContext) {
    let player = ctx.sender();
    cannot_move_error(schema.moveable().contains(player));
    in_encounter_error(!schema.encounter().contains(player));

    let (mut x, mut y) = schema.position()[player].get();
    if (direction == monster_hunter_direction::new_north()) {
        y = y - 1;
    } else if (direction == monster_hunter_direction::new_east()) {
        x = x + 1;
    } else if (direction == monster_hunter_direction::new_south()) {
        y = y + 1;
    } else if (direction == monster_hunter_direction::new_west()) {
        x = x - 1;
    };

    // Constrain position to map size, wrapping around if necessary
    let (width, height, _) = schema.map_config().get().get();
    let x = (x + width) % width;
    let y = (y + height) % height;

    let position = monster_hunter_position::new(x, y);
    space_obstructed_error(!schema.obstruction().contains(position));

    schema.position().set(player, position);

    // let mut generator = random::new_generator(random, ctx);
    // let rand = random::generate_u128(&mut generator);
    // std::debug::print(&rand);

    if(schema.player().contains(player) && schema.encounter_trigger().contains(position)) {
        let rand = sui::clock::timestamp_ms(clock);
        if (rand % 2 == 0) {
            start_encounter(schema, clock, player);
        }
    }
}
