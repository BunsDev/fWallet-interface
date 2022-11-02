import React from "react";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import {
  withdrawDaysLockedLeft,
  withdrawLockTimeLeft,
} from "../../utils/delegation";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import Row from "../Row";
import StatPair from "../StatPair";
import { Button, Typo1 } from "../index";
import useSendTransaction from "../../hooks/useSendTransaction";
import Spacer from "../Spacer";

const WithdrawRequestRow: React.FC<any> = ({
  withdrawRequest,
  size,
  withId,
}) => {
  const { txSFCContractMethod } = useFantomContract();
  const {
    sendTx: handleWithdrawStake,
    isPending,
    isCompleted,
  } = useSendTransaction(() =>
    txSFCContractMethod(SFC_TX_METHODS.WITHDRAW, [
      formatHexToInt(withdrawRequest.toStakerId),
      BigNumber.from(withdrawRequest.withdrawRequestID).toString(),
    ])
  );

  const unlocksIn = withdrawLockTimeLeft(
    Date.now() / 1000 - (60 * 60 * 24 * 8 + 3660)
  );
  const isUnlocked = unlocksIn.every((value) => value === 0);
  const formattedAmountToWithdraw = toFormattedBalance(
    hexToUnit(withdrawRequest.amount)
  );

  return (
    <Row
      key={withdrawRequest.withdrawRequestID}
      style={{
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {withId && (
        <div style={{ width: "3rem" }}>
          <Typo1 style={{ fontWeight: "bold" }}>
            {parseInt(withdrawRequest.toStakerId)}
          </Typo1>
        </div>
      )}
      <div style={{ flex: 2 }}>
        <StatPair
          value1={formattedAmountToWithdraw[0]}
          value2={formattedAmountToWithdraw[1]}
          suffix="FTM"
          value1FontSize={size === "sm" && "18px"}
          value2FontSize={size === "sm" && "14px"}
        />
      </div>
      <Spacer />
      {isUnlocked ? (
        <Button
          disabled={!isUnlocked || isPending || isCompleted}
          style={{
            flex: 3,
            padding: size === "sm" ? ".1rem 1rem" : ".4rem 1.5rem",
            fontSize: size === "sm" && "16px",
          }}
          variant="secondary"
          onClick={() => handleWithdrawStake()}
        >
          {isPending ? "Withdrawing..." : isCompleted ? "Succes" : "Withdraw"}
        </Button>
      ) : (
        <Typo1
          style={{
            fontSize: size === "sm" ? "18px" : "24px",
            fontWeight: "bold",
            textAlign: "end",
          }}
        >
          {unlocksIn[0] > 0 ? `${unlocksIn[0]} days, ` : ""}
          {unlocksIn[1] > 0
            ? `${unlocksIn[1]} hours, `
            : unlocksIn[0] > 0
            ? "0 hours, "
            : ""}
          {unlocksIn[2] > 0 ? `${unlocksIn[2]} minutes` : "0 minutes"}
        </Typo1>
      )}
    </Row>
  );
};

export default WithdrawRequestRow;
