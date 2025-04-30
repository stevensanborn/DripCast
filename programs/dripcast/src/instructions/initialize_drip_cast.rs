use anchor_lang::prelude::*;
use crate::states::dripcast::Dripcast;

//Initialize Dripcast account

#[derive(Accounts)]
pub struct InitializeDripCast<'info> {
    #[account(mut)]
    pub signer: Signer<'info>, //signer of the transaction
    #[account(init_if_needed,
         payer = signer, 
         seeds = [b"dripcast"],
         space = 8 + Dripcast::INIT_SPACE,
         bump
    )]
    pub dripcast: Account<'info, Dripcast>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeDripCast<'info> {
    pub fn init_dripcast(&mut self,bumps:&InitializeDripCastBumps) -> Result<()> {
        self.dripcast.set_inner(Dripcast {
            dripcast_name: "Dripcast".to_string(),
            owner: self.signer.key(),
            bump: bumps.dripcast,
        });
        Ok(())
    }
}

