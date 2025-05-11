use anchor_lang::prelude::*;
use crate::states::monetization::MonetizationState;

#[derive(Accounts)]
#[instruction(monetization: Pubkey)]
pub struct InitializeMonetizationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init_if_needed,
        payer = signer,
        space = 8 + MonetizationState::INIT_SPACE,
        seeds = [b"monetization_state",monetization.key().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub monetization_state: Account<'info, MonetizationState>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeMonetizationState<'info> {
    pub fn initialize_monetization_state(&mut self,monetization: Pubkey,monetization_state_id: String,amount: u64,bumps:&InitializeMonetizationStateBumps) -> Result<()> {
        self.monetization_state.set_inner(MonetizationState {
            user: self.signer.key(),
            monetization: monetization.key(),
            monetization_state_id,
            timestamp: 0,
            amount,
            bump: bumps.monetization_state,
        });
        Ok(())
    }
}
        