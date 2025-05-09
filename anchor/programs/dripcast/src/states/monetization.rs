
use anchor_lang::prelude::*;



#[account]
#[derive(InitSpace)]
pub struct Monetization {
    pub creator: Pubkey,
    #[max_len(36)]
    pub monetization_id: String, //id of the content from database
    #[max_len(32)]
    pub monetization_type: String, //monetization scheme (Payper minute, snippet, etc)
    pub cost: u64, //cost of the content
    pub duration: u64, //duration that the content will be available once purchased
    pub start_time: f32, //start time of the content within a video (in seconds)
    pub end_time: f32, //end time of the content within a video (in seconds)
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct MonetizationState{
    pub monetization: Pubkey,
    pub user: Pubkey,
    pub timestamp: u64,
    pub amount: u64,
    pub bump: u8,
}