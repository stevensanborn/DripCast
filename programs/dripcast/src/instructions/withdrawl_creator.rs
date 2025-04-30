use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::states::creator::Creator;

#[derive(Accounts)]
pub struct WithdrawlCreator<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"creator", creator.owner.as_ref()],
        bump = creator.bump,
        constraint =  creator.owner == signer.key()
    )]
    pub creator: Account<'info, Creator>,
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawlCreator<'info> {
    pub fn withdrawl_creator(&mut self, amount: u64) -> Result<()> {
        // let seeds =
        // &[b"creator",
        // &self.creator.owner.to_bytes()[..],
        // &[self.creator.bump]
        // ];
        // let signer_seeds = &[&seeds[..]];
        
        // let cpi_context = CpiContext::new_with_signer(
        //     self.system_program.to_account_info(), 
        //     system_program::Transfer {
        //         from: self.creator_pda.to_account_info(),
        //         to: self.signer.to_account_info(),
        //     },
        //     signer_seeds,
        // );
        // system_program::transfer(cpi_context, amount)?;

        // let tx = anchor_lang::solana_program::system_instruction::transfer(
        //     &self.creator.key(),
        //     &self.signer.key(),
        //     amount,
        // );
        // self.creator.sub_lamports(amount)?;
        // anchor_lang::solana_program::program::invoke_signed (
        //     &tx,
        //     &[self.creator.to_account_info(), self.signer.to_account_info()],
        //     signer_seeds,
        // )?;
        // let minimum_balance = self.creator.minimum_balance(self.system_program.to_account_info())?;
        // if self.creator.lamports() - amount < minimum_balance {
        //     return Err(ErrorCode::InsufficientBalance.into());
        // }
        self.creator.sub_lamports(amount)?;
        self.signer.add_lamports(amount)?;

        Ok(())
    }
}
