#[allow(lint(public_random))]
module monster_hunter::encounter_system;

use monster_hunter::monster_hunter_monster_catch_result;
use monster_hunter::monster_hunter_errors::not_in_encounter_error;
use sui::random::Random;
use sui::random;
use monster_hunter::monster_hunter_encounter;
use monster_hunter::monster_hunter_monster;
use monster_hunter::monster_hunter_encounterable;
use dubhe::dapp_hub::DappHub;
use monster_hunter::monster_hunter_monster_catch_attempt;
use monster_hunter::monster_hunter_owned_by;

public fun throw_ball(dapp_hub: &mut DappHub, random: &Random, ctx: &mut TxContext) {
    let player = ctx.sender();

    monster_hunter_encounter::ensure_has(dapp_hub, player);

    let (monster, catch_attempts) = monster_hunter_encounter::get(dapp_hub, player);

    let mut generator = random::new_generator(random, ctx);
    let rand = random::generate_u128(&mut generator);
    std::debug::print(&rand);
    if (rand % 2 == 0) {
        // 50% chance to catch monster
        monster_hunter_monster_catch_attempt::set(dapp_hub, monster, monster_hunter_monster_catch_result::new_caught());
        monster_hunter_owned_by::set(dapp_hub, monster, player);
        monster_hunter_encounter::delete(dapp_hub, player);
    } else if (catch_attempts >= 2) {
        // Missed 2 times, monster escapes
        monster_hunter_monster_catch_attempt::set(dapp_hub, monster, monster_hunter_monster_catch_result::new_fled());
        monster_hunter_monster::delete(dapp_hub, monster);
        monster_hunter_encounter::delete(dapp_hub, player);
    } else {
        // Throw missed!
        monster_hunter_monster_catch_attempt::set(dapp_hub, monster, monster_hunter_monster_catch_result::new_missed());
        monster_hunter_encounter::set_catch_attempts(dapp_hub, player, catch_attempts + 1);
    }
}

public fun flee(dapp_hub: &mut DappHub, ctx: &mut TxContext) {
    let player = ctx.sender();

    monster_hunter_encounter::ensure_has(dapp_hub, player);

    let monster = monster_hunter_encounter::get_monster(dapp_hub, player);
    monster_hunter_monster::delete(dapp_hub, monster);
    monster_hunter_encounter::delete(dapp_hub, player);
}