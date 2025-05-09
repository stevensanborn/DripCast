use anchor_lang::prelude::*;
use crate::states::monetization::Monetization;

#[derive(Accounts)]
pub struct UpdateMonetization<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"monetization", signer.key().as_ref(), monetization.monetization_id.as_bytes()],
        bump = monetization.bump,
        realloc =8+  Monetization::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = false,
    )]
    pub monetization: Account<'info, Monetization>,
    pub system_program: Program<'info, System>,
}

impl<'info> UpdateMonetization<'info> {
    pub fn update_monetization(&mut self,
        amount: Option<u64>,
        duration: Option<u64>,
        start_time: Option<f32>,
        end_time: Option<f32>,
        monetization_type: Option<String>) -> Result<()> {
        
        if amount.is_some(){self.monetization.cost = amount.unwrap();}
        if duration.is_some(){self.monetization.duration = duration.unwrap();}
        if start_time.is_some(){self.monetization.start_time = start_time.unwrap();}
        if end_time.is_some(){self.monetization.end_time = end_time.unwrap();}
        if monetization_type.is_some(){self.monetization.monetization_type = monetization_type.unwrap();}

       
        Ok(())
    }
}

