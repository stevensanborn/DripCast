use anchor_lang::prelude::*;
use crate::states::creator::Creator;

#[derive(Accounts)]
pub struct CloseCreator<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, close = signer,
        seeds = [b"creator", signer.key().as_ref()],
        bump = creator.bump
    )]
    pub creator: Account<'info, Creator>,
    pub system_program: Program<'info, System>,
}


impl<'info> CloseCreator<'info> {
    pub fn close_creator(&mut self) -> Result<()> {
        Ok(())
    }
}

