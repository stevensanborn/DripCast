use anchor_lang::prelude::*;
// use crate::states::creator::Creator;
use crate::states::monetization::Monetization;
use crate::errors::DripcastError;

#[derive(Accounts)]
#[instruction(content_id: String)]
pub struct InitializeMonetization<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(init_if_needed,
        payer = signer,
        space = 8 + Monetization::INIT_SPACE,
        seeds = [b"monetization", signer.key().as_ref(), content_id.as_bytes()],
        bump
    )]
    pub monetization: Account<'info, Monetization>,
  
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeMonetization<'info> {

    pub fn initialize_monetization(&mut self,
        content_id: String,
        monetization_type: String,
        cost: u64,
        duration: u64,
        start_time: f32,
        end_time: f32,
        bumps:&InitializeMonetizationBumps
    ) -> Result<()> {
        // Validate string lengths
        require!(
            content_id.len() <= 36,
            DripcastError::ContentIdTooLong
        );
        require!(
            monetization_type.len() <= 32,
            DripcastError::MonetizationTypeTooLong
        );
        
        // Validate times
        require!(
            start_time >= 0.0 && end_time > start_time,
            DripcastError::InvalidTimeRange
        );
        
        self.monetization.set_inner(Monetization {
            creator: self.signer.key(),
            content_id,
            monetization_type,
            cost,
            duration,
            start_time,
            end_time,
            bump: bumps.monetization,
        });

        Ok(())
    }


}


