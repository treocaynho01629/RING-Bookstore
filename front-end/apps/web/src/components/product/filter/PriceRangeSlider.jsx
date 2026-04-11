import PropTypes from "prop-types";
import { Button, TextField, Box } from "@mui/material";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { NumberFormatBase } from "react-number-format";
import { currencyFormat } from "@ring/shared/utils/convert";
import { PRICE_MARKS, MAX_PRICE } from "@ring/shared/utils/filters";
import { useTranslation } from "react-i18next";
import CustomSlider from "@ring/ui/CustomSlider";

const MAX_STEP = 13.3;

const NumericFormatCustom = forwardRef(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  const format = (numStr) => {
    if (numStr === "") return "";
    return currencyFormat.format(numStr);
  };

  return (
    <NumberFormatBase
      {...other}
      getInputRef={ref}
      onValueChange={(values, sourceInfo) => {
        let newValue = values.floatValue;
        // Threshold
        if (newValue < 0) newValue = 0;
        if (newValue > MAX_PRICE) newValue = MAX_PRICE;

        onChange({
          target: { value: newValue },
        });
      }}
      isAllowed={(values) => {
        const { floatValue } = values;
        return floatValue >= 0 && floatValue <= 999999999;
      }}
      format={format}
    />
  );
});

NumericFormatCustom.propTypes = { onChange: PropTypes.func.isRequired };

/**
 * Scale calculate function
 * @param {number} value
 * @returns {number}
 */
function calculateValue(value) {
  const result = Math.round((2 ** value * 1000) / 1000) * 1000;

  // Threshold
  if (result <= 1000) return 0;
  if (result > MAX_PRICE) return MAX_PRICE;

  return result;
}

/**
 * Reverse scale calculate from scale function
 * @param {number} value
 * @returns {number}
 */
function reverseCalculateValue(value) {
  const result = Math.log(value / 1000) / Math.log(2);

  // Threshold
  if (result < 0) return 0;
  if (result > Math.floor(MAX_STEP)) return MAX_STEP;

  return result;
}

/**
 * Format value text from scale function
 * @param {number} value
 * @returns {string}
 */
function valueText(value) {
  let scaledValue = value;
  if (scaledValue >= MAX_PRICE) {
    scaledValue = MAX_PRICE;
  }
  return currencyFormat.format(scaledValue);
}

const PriceRangeSlider = ({ value, onChange, disabledLabel }) => {
  const { t } = useTranslation();

  // Range value
  const firstValue = useMemo(() => reverseCalculateValue(value[0]), [value[0]]);
  const secondValue = useMemo(() => reverseCalculateValue(value[1]), [value[1]]);
  const inputValue = useRef([...value]);
  const [rangeValue, setRangeValue] = useState([firstValue, secondValue]);

  useEffect(() => {
    inputValue.current = [...value];
    setRangeValue([reverseCalculateValue(value[0]), reverseCalculateValue(value[1])]);
  }, [value]);

  /**
   * Handle change range
   * @param {Event} e
   * @param {Array} newValue
   */
  const handleChangeRange = (e, newValue) => {
    setRangeValue(newValue);
    const firstInput = calculateValue(newValue[0]);
    const secondInput = calculateValue(newValue[1]);
    const newInputValue = [firstInput, secondInput];
    inputValue.current = newInputValue;
  };

  /**
   * Handle input from change
   * @param {Event} e
   */
  const handleInputFromChange = (e) => {
    // Input
    let newValue = inputValue.current;
    let newInputFrom = e.target.value === "" ? "" : Number(e.target.value);

    // Threshold
    if (newInputFrom < 0) newInputFrom = 0;
    if (newInputFrom > MAX_PRICE) newInputFrom = MAX_PRICE;
    newValue[0] = newInputFrom;

    // Range
    let newRangeValue = [...rangeValue];
    const calculatedValue = reverseCalculateValue(newValue[0]);
    newRangeValue[0] = calculatedValue;

    //Set
    setRangeValue(newRangeValue);
    inputValue.current = newValue;
  };

  /**
   * Handle input to change
   * @param {Event} e
   */
  const handleInputToChange = (e) => {
    // Input
    let newValue = [...inputValue.current];
    let newInputTo = e.target.value === "" ? "" : Number(e.target.value);
    newValue[1] = newInputTo;

    // Range
    let newRangeValue = [...rangeValue];
    newRangeValue[1] = reverseCalculateValue(newValue[1]);

    // Set
    setRangeValue(newRangeValue);
    inputValue.current = newValue;
  };

  /**
   * Handle change
   */
  const handleChange = () => {
    if (onChange) onChange(inputValue.current);
  };

  /**
   * Handle reset
   */
  const handleReset = () => {
    const defaultValue = [0, MAX_PRICE];
    inputValue.current = defaultValue;
    if (onChange) onChange(defaultValue);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          onChange={handleInputFromChange}
          onBlur={handleChange}
          value={inputValue.current[0]}
          size="small"
          sx={{ backgroundColor: "background.paper" }}
          slotProps={{
            input: {
              sx: { fontSize: 14, input: { textAlign: "center" } },
              inputComponent: NumericFormatCustom,
            },
          }}
        />
        &nbsp;&minus;&nbsp;
        <TextField
          onChange={handleInputToChange}
          onBlur={handleChange}
          value={inputValue.current[1]}
          size="small"
          sx={{ backgroundColor: "background.paper" }}
          slotProps={{
            input: {
              sx: { fontSize: 14, input: { textAlign: "center" } },
              inputComponent: NumericFormatCustom,
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
            valueLabelDisplay={disabledLabel ? "off" : "auto"}
            getAriaValueText={valueText}
            valueLabelFormat={valueText}
            onChange={handleChangeRange}
            onChangeCommitted={handleChange}
          />
        </Box>
      </Box>
      <Button variant="outlined" color="warning" size="large" fullWidth onClick={handleReset}>
        {t("reset")}
      </Button>
    </Box>
  );
};

export default PriceRangeSlider;
