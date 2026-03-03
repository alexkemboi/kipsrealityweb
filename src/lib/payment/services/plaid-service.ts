import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

export const plaidClient = new PlaidApi(configuration);

export async function createStripeBankAccountToken(accessToken: string, accountId: string) {
    // This generates a token specifically for Stripe to use
    const response = await plaidClient.processorTokenCreate({
        access_token: accessToken,
        account_id: accountId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processor: 'stripe' as any, // Using type assertion due to Plaid enum type mismatch
    });
    return response.data.processor_token;
}

export async function checkBalance(accessToken: string, accountId: string, amount: number) {
    // Risk Check: Does the user actually have the money?
    try {
        const response = await plaidClient.accountsBalanceGet({
            access_token: accessToken,
        });

        const account = response.data.accounts.find(a => a.account_id === accountId);

        if (!account || !account.balances.available) {
            // If balance is null (some banks don't provide it), we warn but allow (or block based on policy)
            return { risk: 'UNKNOWN', available: null };
        }

        if (account.balances.available < amount) {
            return { risk: 'HIGH', available: account.balances.available };
        }

        return { risk: 'LOW', available: account.balances.available };
    } catch (error) {
        console.error("Plaid checkBalance error:", error);
        return { risk: 'UNKNOWN', available: null };
    }
}
