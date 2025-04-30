use anchor_lang::prelude::*;
use crate::states::monetization::MonetizationState;
use crate::states::creator::Creator;
use crate::states::dripcast::Dripcast;
use anchor_lang::system_program;
use crate::global::MIN_TRANSACTION_FEE;


#[derive(Accounts)]
pub struct TransferMonetizationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"monetization_state",monetization_state.monetization.key().as_ref(), signer.key().as_ref()],
        bump = monetization_state.bump
    )]
    pub monetization_state: Account<'info, MonetizationState>,
   
    #[account(
        mut,
        seeds = [b"creator", creator.owner.key().as_ref()],
        bump = creator.bump
    )]
    pub creator: Account<'info, Creator>,

  
    #[account(
        mut,
        seeds = [b"dripcast"],
        bump = dripcast.bump
    )]
    pub dripcast: Account<'info, Dripcast>,
   pub system_program: Program<'info, System>,
}

impl<'info> TransferMonetizationState<'info> {
    pub fn transfer_monetization_state(&mut self , amount: u64) -> Result<()> {
        // transfer the amount to the creator PDA
        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(), 
            system_program::Transfer {
                from: self.signer.to_account_info(),
                to: self.creator.to_account_info(),
            });
        system_program::transfer(cpi_context, amount)?;
        msg!("Amount: {} sent to creator PDA", amount);

        // //fee
        let mut fee = amount / 100; // 1% fee using integer division
        if fee < MIN_TRANSACTION_FEE {
            fee = MIN_TRANSACTION_FEE;
        }
        //transfer the fee to the dripcast
        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(), 
            system_program::Transfer {
                from: self.signer.to_account_info(),
                to: self.dripcast.to_account_info(),
            });
        system_program::transfer(cpi_context, fee)?;
        msg!("Fee: {} sent to dripcast", fee);

        let clock = Clock::get()?;
        //save the data
        self.monetization_state.amount = amount;
        self.monetization_state.timestamp = clock.unix_timestamp as u64;

        Ok(())
    }
}   