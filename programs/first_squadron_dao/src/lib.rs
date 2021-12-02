use anchor_lang::prelude::*;

declare_id!("SuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3");

#[program]
pub mod first_squadron_dao {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let proposal_account = &mut ctx.accounts.proposal_account;

        // let whitelist = vec![
        //     "AuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string(),
        //     "BuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string(),
        //     "CuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string(),
        //     "DuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string(),
        //     "EuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string(),
        //     "FuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string()
        // ];

        // let whitelist = "AuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3,BuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3,CuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3,DuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3,EuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3,FuzqjpoMTRp778HYDrbtYGuM95CzwiNMGwh4hmtWkD3".to_string();
        // proposal_account.whitelist = whitelist;
        
        proposal_account.yay = 0;
        proposal_account.nay = 0;
        proposal_account.total = 0;
        proposal_account.whitelist = "adam,bob,cathy,frank,harry,jack".to_string();

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
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 256)]
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
    pub whitelist: String
}
