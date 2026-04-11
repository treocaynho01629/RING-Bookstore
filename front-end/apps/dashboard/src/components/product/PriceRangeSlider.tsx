"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import { NumberFormatBase } from "react-number-format";
import { currencyFormat } from "@ring/shared/utils/convert";
import { PRICE_MARKS, MAX_PRICE } from "@ring/shared/utils/filters";
import { useTranslations } from "next-intl";
import CustomSlider from "@ring/ui/CustomSlider";

const MAX_STEP = 13.3;

interface PriceRangeSliderProps {
  value: [number, number];
  onChange?: (value: [number, number]) => void;
}

interface NumericFormatCustomProps {
  onChange: (event: { target: { value: number | "" } }) => void;
}

const NumericFormatCustom = forwardRef<HTMLInputElement, NumericFormatCustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    const format = (numStr: string) => {
      if (numStr === "") return "";
      return currencyFormat.format(Number(numStr));
    };

    return (
      <NumberFormatBase
        {...(other as any)}
        getInputRef={ref}
        onValueChange={(values) => {
          let newValue = values.floatValue ?? 0;
          // Threshold
          if (newValue < 0) newValue = 0;
          if (newValue > MAX_PRICE) newValue = MAX_PRICE;

          onChange({
            target: { value: newValue },
          });
        }}
        isAllowed={(values) => {
          const { floatValue } = values;
          return (floatValue ?? 0) >= 0 && (floatValue ?? 0) <= 99999999;
        }}
        format={format}
      />
    );
  }
);

/**
 * Scale calculate function
 * @param {number} value
 * @returns {number}
 */
function calculateValue(value: number) {
  const result = Math.round(((2 ** value * 1000) / 1000) * 1000);

  if (result <= 1000) return 0;
  if (result > MAX_PRICE) return MAX_PRICE;

  return result;
}

/**
 * Reverse scale calculate function
 * @param {number} value
 * @returns {number}
 */
function reverseCalculateValue(value: number) {
  const result = Math.log(value / 1000) / Math.log(2);

  if (result < 0) return 0;
  if (result > Math.floor(MAX_STEP)) return MAX_STEP;

  return result;
}

/**
 * Format value text from scale function
 * @param {number} value
 * @returns {string}
 */
function valueText(value: number) {
  let scaledValue = value;
  if (scaledValue >= MAX_PRICE) {
    scaledValue = MAX_PRICE;
  }
  return currencyFormat.format(scaledValue);
}

const PriceRangeSlider = ({ value, onChange }: PriceRangeSliderProps) => {
  const t = useTranslations();

  // Range value
  const firstValue = useMemo(() => reverseCalculateValue(value[0]), [value[0]]);
  const secondValue = useMemo(() => reverseCalculateValue(value[1]), [value[1]]);
  const inputValue = useRef<[number, number]>([...value]);
  const [rangeValue, setRangeValue] = useState<[number, number]>([firstValue, secondValue]);

  useEffect(() => {
    inputValue.current = [...value];
    setRangeValue([reverseCalculateValue(value[0]), reverseCalculateValue(value[1])]);
  }, [value]);

  /**
   * Handle change range
   * @param {unknown} _
   * @param {Array} value
   */
  const handleChangeRange = (event: Event, value: number | number[]) => {
    const range = Array.isArray(value) ? value : [value, value];
    const newRangeValue: [number, number] = [range[0], range[1]];
    setRangeValue(newRangeValue);
    const firstInput = calculateValue(newRangeValue[0]);
    const secondInput = calculateValue(newRangeValue[1]);
    const newInputValue: [number, number] = [firstInput, secondInput];
    inputValue.current = newInputValue;
  };

  /**
   * Handle input from change
   * @param {Event} e
   */
  const handleInputFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Input
    const current = [...inputValue.current] as [number, number];
    let newInputFrom = e.target.value === "" ? 0 : Number(e.target.value);

    // Threshold
    if (newInputFrom < 0) newInputFrom = 0;
    if (newInputFrom > MAX_PRICE) newInputFrom = MAX_PRICE;
    current[0] = newInputFrom;

    // Range
    const newRangeValue: [number, number] = [...rangeValue];
    newRangeValue[0] = reverseCalculateValue(current[0]);

    // Set
    setRangeValue(newRangeValue);
    inputValue.current = current;
  };

  /**
   * Handle input to change
   * @param {Event} e
   */
  const handleInputToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Input
    const current = [...inputValue.current] as [number, number];
    let newInputTo = e.target.value === "" ? 0 : Number(e.target.value);
    current[1] = newInputTo;

    // Range
    const newRangeValue: [number, number] = [...rangeValue];
    newRangeValue[1] = reverseCalculateValue(current[1]);

    // Set
    setRangeValue(newRangeValue);
    inputValue.current = current;
  };

  /**
   * Handle commit change
   */
  const handleCommitChange = () => {
    if (onChange) onChange(inputValue.current);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <TextField
          onChange={handleInputFromChange}
          onBlur={handleCommitChange}
          value={inputValue.current[0]}
          size="small"
          slotProps={{
            input: {
              sx: { fontSize: 14, input: { textAlign: "center" } },
              inputComponent: NumericFormatCustom as any,
            },
          }}
        />
        &nbsp;&minus;&nbsp;
        <TextField
          onChange={handleInputToChange}
          onBlur={handleCommitChange}
          value={inputValue.current[1]}
          size="small"
          slotProps={{
            input: {
              sx: { fontSize: 14, input: { textAlign: "center" } },
              inputComponent: NumericFormatCustom as any,
            },
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <Box width="85%">
          <CustomSlider
            getAriaLabel={() => t("search.price.slider")}
            value={rangeValue}
            min={0}
            step={0.1}
            max={MAX_STEP}
            scale={calculateValue}
            marks={PRICE_MARKS}
            valueLabelDisplay={"auto"}
            getAriaValueText={valueText}
            valueLabelFormat={valueText}
            onChange={handleChangeRange}
            onChangeCommitted={handleCommitChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PriceRangeSlider;
