use anchor_lang::prelude::*;

declare_id!("SuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3");

#[program]
pub mod first_squadron_dao {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let proposal_account = &mut ctx.accounts.proposal_account;
        proposal_account.yay = 0;
        proposal_account.nay = 0;
        proposal_account.total = 0;
        Ok(())
    }

    pub fn vote_yay(ctx: Context<Vote>) -> ProgramResult {
        let proposal_account = &mut ctx.accounts.proposal_account;
        proposal_account.yay += 1;
        proposal_account.total += 1;
        Ok(())
    }
    
    pub fn vote_nay(ctx: Context<Vote>) -> ProgramResult {
        let proposal_account = &mut ctx.accounts.proposal_account;
        proposal_account.nay += 1;
        proposal_account.total += 1;
        Ok(())
    }

    pub fn count_votes(_ctx: Context<Vote>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 16)]
    pub proposal_account: Account<'info, ProposalAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal_account: Account<'info, ProposalAccount>,
}

#[account]
pub struct ProposalAccount {
    pub yay: u8,
    pub nay: u8,
    pub total: u8,
}

pub struct Pilots {
    pub first: u8,
    pub second: u8,
    pub third: u8,
    pub fourth: u8,
    pub fifth: u8,
    pub sixth: u8,
}
