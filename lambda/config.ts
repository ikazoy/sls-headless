const awsAccountId = process.env.ACCOUNT_ID || '';
const awsRegion = process.env.AWS_REGION || '';

export const persistentLogAttributes = { 
    aws_account_id: awsAccountId,
    aws_region: awsRegion,
};
