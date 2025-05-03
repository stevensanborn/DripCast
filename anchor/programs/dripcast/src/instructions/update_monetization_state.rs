

use anchor_lang::prelude::*;
use crate::{ states::monetization::MonetizationState};
#[derive(Accounts)]

pub struct UpdateMonetizationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"monetization_state",monetization_state.monetization.key().as_ref(), signer.key().as_ref()],
        bump = monetization_state.bump
    )]
    pub monetization_state: Account<'info, MonetizationState>,
    pub system_program: Program<'info, System>,
}

impl<'info> UpdateMonetizationState<'info> {
    pub fn update_monetization_state(&mut self,amount: u64) -> Result<()> {
        let clock = Clock::get()?;
        self.monetization_state.amount = amount;
        self.monetization_state.timestamp  = clock.unix_timestamp as u64;
        // self.monetization_state.monetization = monetization;
        Ok(())
    }

   
   
}

