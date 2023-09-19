import { useFormikContext } from "formik";
import { forwardRef, useCallback, useRef } from "react";
import { useSettingsState } from "../../context/settings";
import { CalculateMaxAllowedAmount, CalculateMinAllowedAmount } from "../../lib/fees";
import { SwapFormValues } from "../DTOs/SwapFormValues";
import CurrencyFormField from "./CurrencyFormField";
import NumericInput from "./NumericInput";
import SecondaryButton from "../buttons/secondaryButton";
import { useQueryState } from "../../context/query";
import { useWalletState, useWalletUpdate } from "../../context/wallet";
import { truncateDecimals } from "../utils/RoundDecimals";

const AmountField = forwardRef(function AmountField(_, ref: any) {

    const { values, setFieldValue } = useFormikContext<SwapFormValues>();
    const { networks, currencies } = useSettingsState()
    const query = useQueryState();
    const { currency, from, to, amount } = values

    const { balances, isBalanceLoading } = useWalletState()
    const { getBalance } = useWalletUpdate()
    const name = "amount"
    const walletBalance = balances?.find(b => b?.network === from?.internal_name && b?.token === currency?.asset)
    const walletBalanceAmount = truncateDecimals(walletBalance?.amount, currency?.precision)

    const minAllowedAmount = CalculateMinAllowedAmount(values, networks, currencies);
    const maxAllowedAmount = CalculateMaxAllowedAmount(values, query.balances, walletBalance?.amount, minAllowedAmount)
    const maxAllowedDisplayAmont = truncateDecimals(maxAllowedAmount, currency?.precision)

    const placeholder = (currency && from && to && !isBalanceLoading) ? `${minAllowedAmount} - ${maxAllowedDisplayAmont}` : '0.01234'
    const step = 1 / Math.pow(10, currency?.precision)
    const amountRef = useRef(ref)

    const handleSetMinAmount = () => {
        setFieldValue(name, minAllowedAmount)
    }

    const handleSetMaxAmount = () => {
        setFieldValue(name, maxAllowedAmount)
        getBalance(from)
    }

    return (<>
        <NumericInput
            label={<AmountLabel detailsAvailable={!!(from && to && amount)}
                maxAllowedAmount={maxAllowedDisplayAmont}
                minAllowedAmount={minAllowedAmount}
                isBalanceLoading={isBalanceLoading}
                walletBalance={walletBalanceAmount}
            />}
            disabled={!currency}
            placeholder={placeholder}
            min={minAllowedAmount}
            max={maxAllowedAmount}
            step={isNaN(step) ? 0.01 : step}
            name={name}
            ref={amountRef}
            precision={currency?.precision}
            className="rounded-r-none text-white"
        >
            {
                from && to && currency && < div className="text-xs flex items-center space-x-1 md:space-x-2 ml-2 md:ml-5">
                    <SecondaryButton onClick={handleSetMinAmount} size="xs" className="text-primary-text">
                        MIN
                    </SecondaryButton>
                    <SecondaryButton onClick={handleSetMaxAmount} size="xs" className="text-primary-text">
                        MAX
                    </SecondaryButton>
                </div>
            }
            <CurrencyFormField />
        </NumericInput>
    </>)
});
type AmountLabelProps = {
    detailsAvailable: boolean;
    minAllowedAmount: number;
    maxAllowedAmount: number;
    isBalanceLoading: boolean;
    walletBalance: number
}
const AmountLabel = ({
    detailsAvailable,
    minAllowedAmount,
    maxAllowedAmount,
    isBalanceLoading,
    walletBalance,
}: AmountLabelProps) => {
    return <div className="flex items-center w-full justify-between">
        <div className="flex items-center space-x-2">
            <p>Amount</p>
            {
                detailsAvailable &&
                <div className="text-xs text-primary-text flex items-center space-x-1">
                    <span>(Min:&nbsp;</span>{minAllowedAmount}<span>&nbsp;- Max:&nbsp;</span>{isBalanceLoading ? <span className="ml-1 h-3 w-6 rounded-sm bg-gray-500 animate-pulse" /> : <span>{maxAllowedAmount}</span>}<span>)</span>
                </div>
            }
        </div>
        {
            !isNaN(walletBalance) &&
            <div className="border-primary-text text-xs text-primary-text flex items-center space-x-1"><span>Balance:</span> {isBalanceLoading ? <span className="ml-1 h-3 w-6 rounded-sm bg-gray-500 animate-pulse" /> : <span>{walletBalance}</span>}</div>
        }
    </div>
}

export default AmountField