use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod first_squadron_dao {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let proposal = &mut ctx.accounts.proposal;
        proposal.yay = 0;
        proposal.nay = 0;
        proposal.accumulator = 0;
        proposal.total = 0;
        Ok(())
    }

    pub fn vote_yay(ctx: Context<Vote>) -> ProgramResult {
        let proposal = &mut ctx.accounts.proposal;
        proposal.yay += 1;
        proposal.accumulator += 1;
        Ok(())
    }
    
    pub fn vote_nay(ctx: Context<Vote>) -> ProgramResult {
        let proposal = &mut ctx.accounts.proposal;
        proposal.nay += 1;
        proposal.accumulator += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 16)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[account]
pub struct Proposal {
    pub yay: u8,
    pub nay: u8,
    pub accumulator: u8,
    pub total: u8,
    pub has_voted: u64
}

pub struct Pilots {
    pub first: u8,
    pub second: u8,
    pub third: u8,
    pub fourth: u8,
    pub fifth: u8,
    pub sixth: u8,
}
