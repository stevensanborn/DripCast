
use anchor_lang::prelude::*;
use crate::states::creator::Creator;
// use crate::errors::DripcastError;

#[derive(Accounts)]

pub struct InitializeCreator<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init_if_needed,
        payer = signer,
        space = 8 + Creator::INIT_SPACE,
        seeds = [b"creator", signer.key().as_ref()],
        bump
    )]
    pub creator: Account<'info, Creator>,
    pub system_program: Program<'info, System>,
}   

impl<'info> InitializeCreator<'info> {
    pub fn initialize_creator(&mut self, user_id: String,bumps:&InitializeCreatorBumps) -> Result<()> {

        self.creator.set_inner(Creator {
            user_id,
            owner: self.signer.key(),
            bump: bumps.creator,
        });
        Ok(())
    }
}   