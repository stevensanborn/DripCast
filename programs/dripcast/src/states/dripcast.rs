
use anchor_lang::prelude::*;

//main pda for dripcast account
#[account]
#[derive(InitSpace)]
pub struct Dripcast {
    #[max_len(32)]
    pub dripcast_name: String,
    pub owner: Pubkey,
    pub bump: u8,
}

