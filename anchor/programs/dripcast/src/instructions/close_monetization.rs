use anchor_lang::prelude::*;
use crate::states::monetization::Monetization;

#[derive(Accounts)]
pub struct CloseMonetization<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,  
    #[account(mut,
        close = signer,
        seeds = [b"monetization", signer.key().as_ref(), monetization.content_id.as_bytes()],
        bump = monetization.bump)]
    pub monetization: Account<'info, Monetization>,
    pub system_program: Program<'info, System>,
}

impl<'info> CloseMonetization<'info> {
    pub fn close_monetization(&mut self) -> Result<()> {
        Ok(())
    }
}


