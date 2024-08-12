import { ISelectMenuItem } from '../Shared/Props/selectMenuItem'
import {
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandWrapper
} from '../../shadcn/command'
import React, { useCallback } from "react";
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import SelectItem from '../Shared/SelectItem';
import { SelectProps } from '../Shared/Props/SelectProps'
import Modal from '../../modal/modal';
import SpinIcon from '../../icons/spinIcon';
import { LeafletHeight } from '../../modal/leaflet';

export interface CommandSelectProps extends SelectProps {
    show: boolean;
    setShow: (value: boolean) => void;
    searchHint: string;
    valueGrouper: (values: ISelectMenuItem[]) => SelectMenuItemGroup[];
    isLoading: boolean;
    modalHeight?: LeafletHeight;
    modalContent?: React.ReactNode;
    requireConfirmation?: boolean;
    selectedItem?: ISelectMenuItem | null;
    setSelectedItem?: (item: ISelectMenuItem | null) => void;
}

export class SelectMenuItemGroup {
    constructor(init?: Partial<SelectMenuItemGroup>) {
        Object.assign(this, init);
    }

    name: string;
    items: ISelectMenuItem[];
}

export default function CommandSelect({ values, value, setValue, show, setShow, searchHint, valueGrouper, isLoading, modalHeight = 'full', modalContent, requireConfirmation = false, selectedItem, setSelectedItem }: CommandSelectProps) {
    const { isDesktop } = useWindowDimensions();

    let groups: SelectMenuItemGroup[] = valueGrouper(values);
    const handleSelectValue = useCallback((item: ISelectMenuItem) => {
        setValue(item);
        setSelectedItem?.(selectedItem?.id === item.id ? null : item);
        setShow(false);
    }, [setValue, setShow, requireConfirmation, selectedItem, setSelectedItem]);

    return (
        <Modal height={modalHeight} show={show} setShow={setShow} modalId='comandSelect'>
            {show ?
                <CommandWrapper>
                    {searchHint && <CommandInput autoFocus={isDesktop} placeholder={searchHint} />}
                    {modalContent}
                    {!isLoading ?
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            {groups.filter(g => g.items?.length > 0).map((group) => {
                                return (
                                    <CommandGroup key={group.name} heading={group.name}>
                                        {group.items.map(item => {
                                            return (
                                                <CommandItem className={`${selectedItem?.id === item.id || (!selectedItem && item.name === value?.name) ? "bg-secondary-600" : ""}`} disabled={!item.isAvailable.value} value={item.name} key={item.id} onSelect={() => handleSelectValue(item)}>
                                                    <SelectItem item={item} />
                                                </CommandItem>
                                            )
                                        })
                                        }
                                    </CommandGroup>)
                            })}
                        </CommandList>
                        :
                        <div className='flex justify-center h-full items-center'>
                            <SpinIcon className="animate-spin h-5 w-5" />
                        </div>
                    }
                </CommandWrapper>
                : <></>
            }
        </Modal>
    )
}