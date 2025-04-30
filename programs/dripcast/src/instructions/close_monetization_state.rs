use anchor_lang::prelude::*;
use crate::states::monetization::MonetizationState;

#[derive(Accounts)]
pub struct CloseMonetizationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, close = signer,
        seeds = [b"monetization_state",monetization_state.monetization.key().as_ref(), signer.key().as_ref()],
        bump = monetization_state.bump
    )]
    pub monetization_state: Account<'info, MonetizationState>,
    pub system_program: Program<'info, System>,
   
}

impl<'info> CloseMonetizationState<'info> {
    pub fn close_monetization_state(&mut self) -> Result<()> {
        Ok(())
    }
}


