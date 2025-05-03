use anchor_lang::prelude::*;

use crate::states::dripcast::Dripcast;


#[derive(Accounts)]
pub struct WithdrawlDripcast<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"dripcast"],
        bump = dripcast.bump,
        constraint =  dripcast.owner == signer.key()
    )]
    pub dripcast: Account<'info, Dripcast>,
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawlDripcast<'info> {
    pub fn withdrawl_dripcast(&mut self, amount: u64) -> Result<()> {
        
        self.dripcast.sub_lamports(amount)?;
        self.signer.add_lamports(amount)?;

        Ok(())
    }
}
