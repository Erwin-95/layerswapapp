import { ExclamationIcon, InformationCircleIcon } from "@heroicons/react/outline";
import { FC } from "react";

type messageType = 'warning' | 'informating'

type Props = {
    children: JSX.Element | JSX.Element[] | string;
    messageType?: messageType;
    className?: string
}

function constructIcons(messageType: messageType) {

    let iconStyle: JSX.Element

    switch (messageType) {
        case 'warning':
            iconStyle = <ExclamationIcon className="sm:h-5 sm:w-5 h-4 w-4 text-black" />;
            break;
        case 'informating':
            iconStyle = <InformationCircleIcon className="sm:h-5 sm:w-5 h-4 w-4 text-white" />;
            break;
    }
    return iconStyle
}

const WarningMessage: FC<Props> = (({ children, className, messageType = 'warning' }) => {
    return (
        <div className={`flex-col w-full rounded-md ${messageType == 'warning' ? 'bg-yellow-400' : "bg-slate-800 text-white"} shadow-lg p-2 ${className}`}>
            <div className='flex items-center'>
                <div className={`mr-2 p-2 rounded-lg ${messageType == 'warning' ? 'bg-yellow-500' : "bg-slate-900 text-white"}`}>
                    {constructIcons(messageType)}
                </div>
                <div className="text-xs sm:text-sm">
                    {children}
                </div>
            </div>
        </div>
    )
})

export default WarningMessage;