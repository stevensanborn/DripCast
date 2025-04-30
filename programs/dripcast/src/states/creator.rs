use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Creator {
    #[max_len(36)]
    pub user_id: String, //database of the creator  (needed?)
    /// CHECK: This is safe because we only use the public key for identification, not for reading or writing data.
    pub owner: Pubkey,
    pub bump: u8,
}