use anchor_lang::prelude::*;

declare_id!("GtT93NhhvnWu6LWL7yNeHjqLehNgGZeTcJLxV74eNjWm");

#[program]
pub mod squadron_one_dao {
    use super::*;

    // =====================
    // Initialize Function
    // =====================
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        // Initialize the base account.
        let base_account = &mut ctx.accounts.base_account;

        // Set the authority on the base account as the account that starts the Dapp.
        base_account.authority = ctx.accounts.authority.key();

        Ok(())
    }

    // =====================
    // Authorized Functions
    // =====================
    pub fn add_whitelist(
        ctx: Context<AuthorityContext>,
        p_pilots: Vec<Pubkey>
    ) -> ProgramResult {
        // Initialize the base account.
        let base_account = &mut ctx.accounts.base_account;

        // Loop over the vector of p_pilots payload from request.
        for p_address in p_pilots.iter() {
            // Boolean to track if p_pilot already exists on whitelist.
            let mut exists = false;

            // Loop through the pilots vector in the base account.
            for (index, pilot) in base_account.whitelist.iter().enumerate() {
                // If the base_account pilot matches the p_pilot,
                if pilot.address == *p_address {
                    // Mark them as a voter in case they were marked inactive.
                    base_account.whitelist[index].active = true;

                    // Flag that the p_pilot already exists.
                    exists = true;

                    // Skip if they already exist.
                    break;
                }
            }

            // Add the pilot if the p_pilot didn't exist in the base_account.
            if !exists {
                base_account.whitelist.push(Pilot {
                    address: *p_address,
                    active: true,
                })
            }
        }

        Ok(())
    }

    pub fn mark_inactive(
        ctx: Context<AuthorityContext>,
        p_pilots: Vec<Pubkey>
    ) -> ProgramResult {
        // Initialize the base account.
        let whitelist = &mut ctx.accounts.base_account.whitelist;

        // Loop over the vector of p_pilots payload from request.
        for i in 0..p_pilots.len() {
            // Then loop over the whitelist addresses concurrently.
            for j in 0..whitelist.len() {
                // We only want to target the active ones and
                // mark inactive only if the addresses is specified in the request.
                if whitelist[j].active && (p_pilots[i] == whitelist[j].address){
                    // Marks user as inactive.
                    whitelist[j].active = false;
                }
            }
        }

        Ok(())
    }

    // =====================
    // Unauthorized Functions
    // =====================
    pub fn vote(
        ctx: Context<VoterContext>,
        p_choice: u8
    ) -> ProgramResult {
        // Initialize the base account.
        let base_account = &mut ctx.accounts.base_account;

        // Capture the voter's pubkey.
        let p_voter = ctx.accounts.voter.key();

        // Tracker if person is allowed to vote.
        let mut can_vote = false;

        // Check if the address is on the whitelist.
        for pilot in base_account.whitelist.iter() {
            if pilot.active && (pilot.address == p_voter) {
                can_vote = true;
            }
        }

        // This person is allowed to vote.
        if can_vote {
            // Tracker if the pubkey has already voted.
            let mut has_voted = false;

            // If the Pubkey addresses match, flag p_voter already voted.
            for vote in base_account.votelist.iter() {
                if vote.address == p_voter {
                    has_voted = true;
                    msg!("Already vote.");
                    break;
                }
            }

            // If p_voter has not voted, tally their vote.
            if !has_voted {
                base_account.votelist.push(Voter {
                    address: p_voter,
                    choice: p_choice,
                });

                if p_choice == 0 {
                    base_account.nay += 1;
                }
                else if p_choice == 1 {
                    base_account.yay += 1;
                }
            }
        } else {
            msg!("Voting permission denied.");
        }

        Ok(())
    }
}

// =====================
// Initialize Struct
// =====================
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 // Account Discriminator
        + 32 // Authority Pubkey
        + 320 // For 10 pubkeys (10 * 32)
        + 1024 // For good measure
    )]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// =====================
// Context Structs
// =====================
#[derive(Accounts)]
pub struct AuthorityContext<'info> {
    #[account(mut, has_one = authority)]
    pub base_account: Account<'info, BaseAccount>,
    pub authority: Signer<'info>
}

#[derive(Accounts)]
pub struct VoterContext<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    pub voter: Signer<'info>
}

// =====================
// Account Structs
// =====================
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Pilot {
    pub address: Pubkey,
    pub active: bool,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Voter {
    pub address: Pubkey,
    pub choice: u8,
}

#[account]
#[derive(Default)]
pub struct BaseAccount {
    authority: Pubkey,
    pub whitelist: Vec<Pilot>,
    pub votelist: Vec<Voter>,
    pub yay: u8,
    pub nay: u8,
}
