import { formatHexToBN, formatHexToInt } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";

export const MIN_LOCKUP_DAYS = 14;
export const DAY_IN_SECONDS = 60 * 60 * 24;
export const BASE_APR = 0.01804; //0.042
export const LOCK_APR = 0.042173; //0.0981

export interface Validators {
  stakers: Validator[];
}

export interface Validator {
  id: string;
  address: string;
  createdTime?: string;
  downtime?: string;
  stakerInfo?: {
    name?: string;
    website?: string;
    contact?: string;
    logoUrl?: string;
  };
  delegatedLimit: string;
  lockedUntil: string;
  isActive: boolean;
}

export interface AccountDelegations {
  delegationsByAddress: {
    totalCount: string;
    edges: AccountDelegation[];
  };
}

export interface AccountDelegation {
  amount: string;
  amountDelegated: string;
  outstandingSFTM: string;
  pendingRewards: {
    amount: string;
  };
  isDelegationLocked: boolean;
  lockedUntil: string;
  toStakerId: string;
  withdrawRequest: any[];
  lockedAmount: string;
  // TODO clean up circular
  delegation: AccountDelegation;
}

export interface AccountDelegationSummary {
  totalStaked: BigNumber;
  totalPendingRewards: BigNumber;
  totalMintedSFTM: BigNumber;
  totalLocked: BigNumber;
  totalAvailableSFTM: BigNumber;
}

// Validator functions
export const getValidators = (delegations: Validators): Validator[] => {
  if (!delegations || !delegations.stakers) {
    return null;
  }

  return delegations.stakers;
};

export const validatorNodeUptime = (delegation: Validator) => {
  return (
    100 -
    parseInt(delegation.downtime) /
      (Date.now() - parseInt(delegation.createdTime))
  );
};

export const getValidatorsWithLockup = (validators: Validators) => {
  const now = Date.now() / 1000;
  return validators.stakers.filter(
    (validator) =>
      formatHexToInt(validator.lockedUntil) - now >
      MIN_LOCKUP_DAYS * DAY_IN_SECONDS
  );
};

// AccountDelegation functions
export const getAccountDelegations = (
  delegations: AccountDelegations
): AccountDelegation[] => {
  if (!delegations || !delegations.delegationsByAddress) {
    return;
  }

  return delegations.delegationsByAddress.edges;
};

export const getAccountDelegationSummary = (
  delegations: AccountDelegations
): AccountDelegationSummary => {
  const initial = {
    totalStaked: BigNumber.from(0),
    totalLocked: BigNumber.from(0),
    totalPendingRewards: BigNumber.from(0),
    totalMintedSFTM: BigNumber.from(0),
    totalAvailableSFTM: BigNumber.from(0),
  };

  if (!delegations || !delegations.delegationsByAddress) {
    return;
  }
  if (!delegations.delegationsByAddress.edges.length) {
    return initial;
  }

  return delegations.delegationsByAddress.edges.reduce(
    (accumulated: any, current: any) => {
      const stake = formatHexToBN(current.delegation.amountDelegated);
      const reward = formatHexToBN(current.delegation.pendingRewards.amount);
      const minted = formatHexToBN(current.delegation.outstandingSFTM);
      const locked = formatHexToBN(current.delegation.lockedAmount);
      const availableToMint = locked.sub(minted);

      return {
        totalStaked: stake.add(accumulated.totalStaked),
        totalLocked: locked.add(accumulated.totalLocked),
        totalPendingRewards: reward.add(accumulated.totalPendingRewards),
        totalMintedSFTM: minted.add(accumulated.totalMintedSFTM),
        totalAvailableSFTM: availableToMint.add(accumulated.totalAvailableSFTM),
      };
    },
    initial
  );
};

export const delegationDaysLockedLeft = (delegation: AccountDelegation) => {
  const lockedUntil = formatHexToBN(delegation.lockedUntil).toString();
  return lockedUntil
    ? parseInt(
        (
          (parseInt(lockedUntil) * 1000 - Date.now()) /
          (1000 * 60 * 60 * 24)
        ).toString()
      )
    : 0;
};

// TODO use raw input
export const withdrawDaysLockedLeft = (createdTime: number, daysLocked = 7) => {
  const lockedTime = daysLocked * 24 * 60 * 60 * 1000;
  return parseInt(
    (
      (createdTime * 1000 + lockedTime - Date.now()) /
      (1000 * 60 * 60 * 24)
    ).toString()
  );
};

export const withdrawLockTimeLeft = (createdTime: number, daysLocked = 7) => {
  const lockedTime = daysLocked * DAY_IN_SECONDS * 1000;

  const timeLeft = createdTime * 1000 + lockedTime - Date.now();
  const daysLeft = Math.floor(timeLeft / (DAY_IN_SECONDS * 1000));
  if (daysLeft < 0) {
    return [0, 0, 0];
  }
  const hoursLeft = Math.floor(
    (timeLeft - daysLeft * DAY_IN_SECONDS * 1000) / (60 * 60 * 1000)
  );
  if (hoursLeft < 0) {
    return [daysLeft, 0, 0];
  }
  const minutesLeft = Math.floor(
    (timeLeft - daysLeft * DAY_IN_SECONDS * 1000 - hoursLeft * 60 * 60 * 1000) /
      (60 * 1000)
  );
  return [daysLeft, hoursLeft, minutesLeft];
};

export const generateWithdrawalRequestId = () => {
  const hexString = Array(16)
    .fill(0)
    .map(() => Math.round(Math.random() * 0xf).toString(16))
    .join("");

  const randomBigInt = BigInt(`0x${hexString}`);
  return BigNumber.from(randomBigInt);
};

// Mix and / or merge functions
export const enrichAccountDelegationsWithStakerInfo = (
  accountDelegations: AccountDelegation[],
  delegations: Validator[]
) => {
  return accountDelegations.map((accountDelegation: any) => ({
    ...accountDelegation,
    delegationInfo: delegations.find((delegation) => {
      return delegation.id === accountDelegation.delegation.toStakerId;
    }),
  }));
};

// TODO use raw input
export const delegatedToAddressesList = (
  accountDelegations: any,
  delegations: any
) => {
  if (!accountDelegations?.data || !delegations?.data) {
    return;
  }
  return accountDelegations?.data?.delegationsByAddress?.edges.map(
    (edge: any) => [
      parseInt(edge.delegation.toStakerId),
      delegations.data.stakers.find(
        (delegationInfo: any) =>
          delegationInfo.id === edge.delegation.toStakerId
      ).stakerAddress,
    ]
  );
};

// export const minLockDays = (accountDelegation: AccountDelegation) => {
//   const now = Date.now() / 1000;
//   return Math.max(
//     MIN_LOCKUP_DAYS,
//     Math.floor(
//       (parseInt(accountDelegation.lockedUntil) - now) / DAY_IN_SECONDS
//     ) + 1
//   );
// };

export const maxLockDays = (validator: Validator) => {
  const now = Date.now() / 1000;
  return Math.floor((parseInt(validator.lockedUntil) - now) / DAY_IN_SECONDS);
};

export const maxLockSeconds = (validator: Validator) => {
  const now = Date.now() / 1000;
  return Math.floor(parseInt(validator.lockedUntil) - now);
};

export const canLockDelegation = (
  accountDelegation: AccountDelegation,
  validator: Validator
) => {
  const now = Date.now() / 1000;

  const isValidLockDuration =
    parseInt(validator.lockedUntil) - now > MIN_LOCKUP_DAYS * DAY_IN_SECONDS;
  const isNotAlreadyLocked =
    accountDelegation?.delegation?.lockedUntil === "0x0" || !accountDelegation;
  return isValidLockDuration && isNotAlreadyLocked;
};

export const calculateDelegationApr = (lockedDays = 0) => {
  const calculateWithLockedDays = lockedDays >= 365 ? 365 : lockedDays;
  const paBase = BASE_APR;
  const paLock = LOCK_APR;

  return paBase + calculateWithLockedDays * (paLock / 365);
};
