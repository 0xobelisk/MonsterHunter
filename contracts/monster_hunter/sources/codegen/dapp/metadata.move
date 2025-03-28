  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module monster_hunter::monster_hunter_dapp_metadata {

  use std::ascii::String;

  public struct DappMetadata has drop, copy, store {
    name: String,
    description: String,
    icon_url: String,
    website_url: String,
    created_at: u64,
    partners: vector<String>,
  }

  public fun new(
    name: String,
    description: String,
    icon_url: String,
    website_url: String,
    created_at: u64,
    partners: vector<String>,
  ): DappMetadata {
    DappMetadata {
            name,
            description,
            icon_url,
            website_url,
            created_at,
            partners,
        }
  }

  public fun set(
    self: &mut DappMetadata,
    name: String,
    description: String,
    icon_url: String,
    website_url: String,
    created_at: u64,
    partners: vector<String>,
  ) {
    self.name = name;
    self.description = description;
    self.icon_url = icon_url;
    self.website_url = website_url;
    self.created_at = created_at;
    self.partners = partners;
  }

  public fun set_name(self: &mut DappMetadata, name: String) {
    self.name = name;
  }

  public fun set_description(self: &mut DappMetadata, description: String) {
    self.description = description;
  }

  public fun set_icon_url(self: &mut DappMetadata, icon_url: String) {
    self.icon_url = icon_url;
  }

  public fun set_website_url(self: &mut DappMetadata, website_url: String) {
    self.website_url = website_url;
  }

  public fun set_created_at(self: &mut DappMetadata, created_at: u64) {
    self.created_at = created_at;
  }

  public fun set_partners(self: &mut DappMetadata, partners: vector<String>) {
    self.partners = partners;
  }

  public fun get_name(self: &DappMetadata): String {
    self.name
  }

  public fun get_description(self: &DappMetadata): String {
    self.description
  }

  public fun get_icon_url(self: &DappMetadata): String {
    self.icon_url
  }

  public fun get_website_url(self: &DappMetadata): String {
    self.website_url
  }

  public fun get_created_at(self: &DappMetadata): u64 {
    self.created_at
  }

  public fun get_partners(self: &DappMetadata): vector<String> {
    self.partners
  }
}
