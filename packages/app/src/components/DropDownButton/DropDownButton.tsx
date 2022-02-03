import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useOutsideClick from "../../hooks/useOutsideClick";

const DropDownButton: React.FC<any> = ({
  children,
  DropDown,
  disabled,
  triggerClose,
  width,
  dropdownWidth,
  dropdownTop,
  dropdownRight,
  dropdownLeft,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (triggerClose) {
      setIsOpen(false);
    }
  }, [triggerClose]);

  useOutsideClick(dropdownRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div style={{ width, position: "relative" }}>
      <div style={{ width }} onClick={() => !disabled && setIsOpen(!isOpen)}>
        {children}
      </div>
      {isOpen && (
        <StyledDropDown
          ref={dropdownRef}
          width={dropdownWidth}
          top={dropdownTop}
          left={dropdownLeft}
          right={dropdownRight}
        >
          <DropDown />
        </StyledDropDown>
      )}
    </div>
  );
};

const StyledDropDown = styled.div<{
  width?: number;
  top?: number;
  left?: number;
  right?: number;
}>`
  position: absolute;
  width: ${(props) => props.width}px;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left && `${props.left}px`};
  right: ${(props) => props.right && `${props.right}px`};
  z-index: 10;
`;

export default DropDownButton;
