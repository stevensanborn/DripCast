

use anchor_lang::prelude::*;



#[error_code]
pub enum DripcastError {
    #[msg("Content ID must be 36 characters or less")]
    ContentIdTooLong,
    #[msg("Monetization type must be 32 characters or less")]
    MonetizationTypeTooLong,
    #[msg("Invalid time range: end time must be greater than start time and start time must be non-negative")]
    InvalidTimeRange,
    #[msg("User ID must be 36 characters or less")]
    UserIdTooLong,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
