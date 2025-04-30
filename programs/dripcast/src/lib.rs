// #![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;


mod instructions;
mod states;
mod errors;
mod global;
use instructions::*;

declare_id!("7Nnu3s1NGhjSnomnkv8yqtenaEHi5sjoKdwRCH5rJWMY");

#[program]
pub mod dripcast {
    use super::*;

    pub fn initialize_dripcast(ctx: Context<InitializeDripCast>) -> Result<()> {
        ctx.accounts.init_dripcast(&ctx.bumps)
        
    }

    // /* CREATOR FUNCTIONS */
    pub fn initialize_creator(ctx: Context<InitializeCreator>, user_id: String) -> Result<()> {
        ctx.accounts.initialize_creator(user_id,&ctx.bumps)
    }

    // /* MONETIZATION FUNCTIONS */
    pub fn initialize_monetization(
        ctx: Context<InitializeMonetization>,
        content_id: String, //id of the content from database
        monetization_type: String, //type of subscription 
        cost: u64,
        duration: u64,
        start_time: f32,
        end_time: f32,
    ) -> Result<()> {
        ctx.accounts.initialize_monetization(
            content_id,
            monetization_type,
            cost,
            duration,
            start_time,
            end_time,
            &ctx.bumps
        )
    }


    pub fn update_monetization(
        ctx: Context<UpdateMonetization>,
        amount: Option<u64>,
        duration: Option<u64>,
        start_time: Option<f32>,
        end_time: Option<f32>,
        monetization_type: Option<String>,
    ) -> Result<()> {
        ctx.accounts.update_monetization(amount,duration,start_time,end_time,monetization_type)
    }


    // /* MONETIZATION STATE FUNCTIONS */
    pub fn initialize_monetization_state(
        ctx: Context<InitializeMonetizationState>,
        monetization: Pubkey,
    ) -> Result<()> {
        ctx.accounts.initialize_monetization_state(monetization,&ctx.bumps)
    }

    pub fn update_monetization_state(
        ctx: Context<UpdateMonetizationState>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.update_monetization_state(amount)
    }

    pub fn transfer_monetization_state(
        ctx: Context<TransferMonetizationState>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.transfer_monetization_state(amount)
    }

    pub fn withdrawl_creator(
        ctx: Context<WithdrawlCreator>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.withdrawl_creator(amount)
    }

    pub fn close_monetization_state(
        ctx: Context<CloseMonetizationState>,
    ) -> Result<()> {
        ctx.accounts.close_monetization_state()
    }

    pub fn close_monetization(
        ctx: Context<CloseMonetization>,
    ) -> Result<()> {
        ctx.accounts.close_monetization()
    }
}
