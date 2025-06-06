#[allow(lint(public_random))]
module monster_hunter::map_system;
use sui::clock::Clock;
use dubhe::dapp_hub::DappHub;
use sui::address;
use monster_hunter::monster_hunter_direction;
use monster_hunter::monster_hunter_position;
use monster_hunter::monster_hunter_direction::Direction;
use monster_hunter::monster_hunter_dapp_key;
use monster_hunter::entity_id::position_to_entity_id;
use monster_hunter::monster_hunter_map_config;
use monster_hunter::monster_hunter_obstruction;
use monster_hunter::monster_hunter_player;
use monster_hunter::monster_hunter_moveable;
use monster_hunter::monster_hunter_encounterable;
use monster_hunter::monster_hunter_encounter_trigger;
use sui::random::Random;
use sui::random;
use sui::random::RandomGenerator;
use monster_hunter::monster_hunter_monster_type;
use monster_hunter::monster_hunter_monster;
use monster_hunter::monster_hunter_encounter;

public fun register(dapp_hub: &mut DappHub,  x: u64, y: u64, ctx: &mut TxContext) {
    let player = ctx.sender();

    let entity_id = position_to_entity_id(x, y);
    monster_hunter_position::ensure_not_has(dapp_hub, entity_id);
    // Constrain position to map size, wrapping around if necessary
    let (width, height, _) = monster_hunter_map_config::get(dapp_hub);
    let x = (x + width) % width;
    let y = (y + height) % height;

    monster_hunter_obstruction::ensure_not_has(dapp_hub, entity_id);
    monster_hunter_player::set(dapp_hub, player);
    monster_hunter_moveable::set(dapp_hub, player);
    monster_hunter_encounterable::set(dapp_hub, player);
    monster_hunter_position::set(dapp_hub, entity_id, x, y);
}

public fun move_position(dapp_hub: &mut DappHub, rand: &Random, direction: Direction, ctx: &mut TxContext) {
    let player = ctx.sender();
    monster_hunter_moveable::ensure_has(dapp_hub, player);
    monster_hunter_encounterable::ensure_not_has(dapp_hub, player);

    let (mut x, mut y) = monster_hunter_position::get(dapp_hub, player);
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
    let (width, height, _) = monster_hunter_map_config::get(dapp_hub);
    let x = (x + width) % width;
    let y = (y + height) % height;

    let position = position_to_entity_id(x, y);
    monster_hunter_obstruction::ensure_not_has(dapp_hub, position);

    monster_hunter_position::set(dapp_hub, player, x, y);

    if(monster_hunter_encounterable::has(dapp_hub, player) && monster_hunter_encounter_trigger::has(dapp_hub, position)) {
        let mut generator = random::new_generator(rand, ctx);
        let rand = random::generate_u128(&mut generator);
        std::debug::print(&rand);
       if (rand % 5 == 0) {
            start_encounter(dapp_hub, &mut generator, player);
        }
    }
}

fun start_encounter(dapp_hub: &mut DappHub, generator: &mut RandomGenerator, player: address) {
    let monster = random::generate_u256(generator);
    let mut monster_type =monster_hunter_monster_type::new_eagle();
    if (monster % 4 == 1) {
        monster_type =monster_hunter_monster_type::new_eagle();
    } else if (monster % 4 == 2) {
        monster_type =monster_hunter_monster_type::new_rat();
    } else if (monster % 4 == 3) {
        monster_type =monster_hunter_monster_type::new_caterpillar();
    };

    let monster = address::from_u256(monster);
    monster_hunter_monster::set(dapp_hub, monster, monster_type);
    std::debug::print(&monster);
    std::debug::print(&monster_type);
    monster_hunter_encounter::set(dapp_hub, player, monster, 0);
}
