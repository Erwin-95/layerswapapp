import { useState } from "react"
import { useDepositMethod } from "../../../../../context/depositMethodContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../shadcn/dialog"
import SubmitButton from "../../../../buttons/submitButton"

const ManualTransferNote = () => {
    const { setShowModal: setShowDepositMethodModal, canRedirect } = useDepositMethod()
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="text-xs text-center">
                <div className='text-secondary-text mt-2'>
                    Don’t have a wallet? or want to swap manually?
                </div>
                <div className='text-secondary-text'>
                    <button onClick={() => setOpen(true)} type="button" className='text-primary'>Click here</button><span>, to see how</span>
                </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] text-primary-text">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Swap manually
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-5 space-y-5">
                        <p className="text-xs text-secondary-text">To complete the swap manually you should switch the transfer method to deposit address</p>
                        <div>
                            <object type="image/svg+xml" data="/Bell_Demo_CSS_only.svg">svg-animation</object>
                        </div>
                        <div className="space-y-3">
                            {
                                canRedirect &&
                                <SubmitButton onClick={() => {
                                    setShowDepositMethodModal(true)
                                    setOpen(false)
                                }} className='text-primary' isDisabled={false} isSubmitting={false}>
                                    Take me there
                                </SubmitButton>
                            }
                            <button type="button" onClick={() => { setOpen(false) }} className="flex justify-center w-full">
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ManualTransferNote;