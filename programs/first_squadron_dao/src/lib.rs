use anchor_lang::prelude::*;

declare_id!("HRtvmXDXyGRLU9sVCuMY3x99f3p1NT1p28Fur4ZhH3iz");

#[program]
pub mod first_squadron_dao {
    use super::*;

    // =====================
    // Initialize Function
    // =====================
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        // Initialize the main state.
        let main_state = &mut ctx.accounts.main_state;

        // Set the authority on the main state as the account that starts the Dapp.
        main_state.authority = ctx.accounts.authority.key();

        Ok(())
    }

    // =====================
    // Primary Functions
    // =====================
    pub fn add_whitelist(
        ctx: Context<AuthorityContext>,
        p_pilots: Vec<Pubkey>
    ) -> ProgramResult {
        // Initialize the main state.
        let main_state = &mut ctx.accounts.main_state;

        // Loop over the vector of p_pilots sent with call.
        for p_address in p_pilots.iter() {
            // Boolean to track if p_pilot already exists on main_state.
            let mut exists = false;

            // Loop through the pilots vector in the main state.
            for (index, pilot) in main_state.whitelist.iter().enumerate() {
                // If the main_state pilot matches the p_pilot,
                if pilot.address == *p_address {
                    // Mark them as a voter in case they were marked inactive.
                    main_state.whitelist[index].active = true;

                    // Flag that the p_pilot already exists.
                    exists = true;

                    // Skip if they already exist.
                    break;
                }
            }

            // If the p_pilot didn't exist in the main_state,
            if !exists {
                // Add the pilot to the main state with the Pilot struct.
                main_state.whitelist.push(Pilot {
                    address: *p_address,
                    active: true,
                })
            }
        }

        Ok(())
    }

    pub fn vote(
        ctx: Context<VoterContext>,
        p_choice: u8
    ) -> ProgramResult {
        // Initialize the main state.
        let main_state = &mut ctx.accounts.main_state;

        // Capture the voter's pubkey.
        let p_voter = ctx.accounts.voter.key();

        // Tracker if person is allowed to vote;
        let mut can_vote = false;

        // Check if the address is on the whitelist.
        for pilot in main_state.whitelist.iter() {
            if pilot.address == p_voter {
                can_vote = true;
            }
        }

        // If they are not flagged as allowed, return unit.
        if can_vote {
            // Tracker if the pubkey has already voted.
            let mut has_voted = false;

            // Loop through the votes vector.
            // If the Pubkey addresses match, flag p_voter already voted.
            for vote in main_state.voters.iter() {
                if vote.address == p_voter {
                    has_voted = true;
                    break;
                }
            }

            // If p_voter has not voted, tally their vote.
            if !has_voted {
                main_state.voters.push(Voter {
                    address: p_voter,
                    choice: p_choice,
                });

                if p_choice == 1 {
                    main_state.yay += 1;
                }
                else {
                    main_state.nay += 1;
                }
            }
            else {
                msg!("Already vote.")
            }
        } else {
            msg!("Voting permission denied.")
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
        + 256 // For 6 pubkeys (6 * 32)
        + 1024 // For good measure
    )]
    pub main_state: Account<'info, MainState>,
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
    pub main_state: Account<'info, MainState>,
    pub authority: Signer<'info>
}

#[derive(Accounts)]
pub struct VoterContext<'info> {
    #[account(mut)]
    pub main_state: Account<'info, MainState>,
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
pub struct MainState {
    authority: Pubkey,
    pub whitelist: Vec<Pilot>,
    pub voters: Vec<Voter>,
    pub yay: u8,
    pub nay: u8,
}
