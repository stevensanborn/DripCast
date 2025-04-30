use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::states::creator::Creator;
#[derive(Accounts)]
pub struct WithdrawlCreator<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub creator: Account<'info, Creator>,
    pub system_program: Program<'info, System>,
}


impl<'info> WithdrawlCreator<'info> {
    pub fn withdrawl_creator(&mut self, amount: u64) -> Result<()> {
        let creator_bytes = self.creator.owner.as_ref();
        let seeds = &[b"creator", creator_bytes];
        let signer_seeds = &[&seeds[..]];
        let cpi_context = CpiContext::new_with_signer(
            self.system_program.to_account_info(), 
            system_program::Transfer {
                from: self.signer.to_account_info(),
                to: self.creator.to_account_info(),
            },
            signer_seeds,
        );
        system_program::transfer(cpi_context, amount)?;
        Ok(())
    }
}
