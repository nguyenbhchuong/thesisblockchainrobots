import React, { ChangeEventHandler, useEffect, useState } from "react";
import styles from "./Dropdown.module.css";
import { trimText } from "@/services/utils";

export interface IItemValue {
  id: number;
  name: string;
}

interface IDropdownProps {
  placeHolder: string;
  itemList: string[];
  value: IItemValue;
  onChange: (value: IItemValue) => void;
  modifyDisplay?: (text: string) => string;
}
function Dropdown(props: IDropdownProps) {
  const { placeHolder, itemList, onChange, modifyDisplay } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chosenItem, setChosenItem] = useState(-1);
  let value = props.value;

  //adapt changes from outside
  useEffect(() => {
    setChosenItem(value.id);
  }, [value]);

  //return changes to outside
  const chooseItem = (id: number) => {
    //check id bound
    if (id < 0 || id > itemList.length) return;
    //if good set the state
    value = { id: id, name: itemList[id] };
    onChange(value);
    setIsOpen(false);
    setChosenItem(id);
  };
  return (
    <div className={styles.dropdown}>
      <DropdownButton
        text={chosenItem == -1 ? placeHolder : itemList[chosenItem]}
        isOpen={isOpen}
        onClickAction={(isOpenVal: boolean) => setIsOpen(isOpenVal)}
        modifyDisplay={modifyDisplay}
      />
      <DropdownMenu
        isOpen={isOpen}
        itemList={itemList}
        chooseItem={chooseItem}
        modifyDisplay={modifyDisplay}
      />
    </div>
  );
}

function DropdownButton({
  text,
  isOpen,
  onClickAction,
  modifyDisplay,
}: {
  text: string;
  isOpen: boolean;
  onClickAction: (isOpenVal: boolean) => void;
  modifyDisplay?: (text: string) => string;
}) {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    if (modifyDisplay) {
      setDisplayText(modifyDisplay(text));
    } else {
      setDisplayText(text);
    }
  }, [text]);
  return (
    <div
      className={styles.dropdownButton}
      onClick={() => onClickAction(!isOpen)}
    >
      <p>{trimText(displayText, 11)}</p>
    </div>
  );
}

function DropdownMenu({
  isOpen,
  itemList,
  chooseItem,
  modifyDisplay,
}: {
  isOpen: boolean;
  itemList: string[];
  chooseItem: (id: number) => void;
  modifyDisplay?: (text: string) => string;
}) {
  if (itemList.length > 0)
    return (
      <div className={isOpen ? styles.dropdownMenu : styles.dropdownMenuHide}>
        {itemList.map((value: string, index: number) => {
          return (
            <DropdownItem
              key={index}
              id={index}
              text={value}
              chooseItem={chooseItem}
              modifyDisplay={modifyDisplay}
            />
          );
        })}
      </div>
    );
}

function DropdownItem({
  id,
  text,
  chooseItem,
  modifyDisplay,
}: {
  id: number;
  text: string;
  chooseItem: (id: number) => void;
  modifyDisplay?: (text: string) => string;
}) {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    if (modifyDisplay) {
      setDisplayText(modifyDisplay(text));
    } else {
      setDisplayText(text);
    }
  }, [text]);
  return (
    <div className={styles.dropdownItem} onClick={() => chooseItem(id)}>
      {trimText(displayText, 11)}
    </div>
  );
}
export default Dropdown;
