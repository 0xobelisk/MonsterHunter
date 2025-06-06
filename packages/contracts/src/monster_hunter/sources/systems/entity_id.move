module monster_hunter::entity_id {
use sui::hash::keccak256;
use sui::bcs::to_bytes;
use sui::address;

    public fun position_to_entity_id(x: u64, y: u64): address {
      let mut raw_id = vector::empty();
      raw_id.append(to_bytes(&y));
      raw_id.append(to_bytes(&x));
      address::from_bytes(keccak256(&raw_id))
    }
}