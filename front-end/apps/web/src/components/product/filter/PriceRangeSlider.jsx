import PropTypes from "prop-types";
import { Button, TextField, Box } from "@mui/material";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { NumberFormatBase } from "react-number-format";
import { currencyFormat } from "@ring/shared/utils/convert";
import { marks } from "../../../utils/filters";
import { useTranslation } from "react-i18next";
import CustomSlider from "../../custom/CustomSlider";

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
        //Threshold
        if (newValue < 0) newValue = 0;
        if (newValue > 10000000) newValue = 10000000;

        onChange({
          target: { value: newValue },
        });
      }}
      isAllowed={(values) => {
        const { floatValue } = values;
        return floatValue >= 0 && floatValue <= 99999999;
      }}
      format={format}
    />
  );
});

NumericFormatCustom.propTypes = { onChange: PropTypes.func.isRequired };

// Scale calculate function
function calculateValue(value) {
  const result = Math.round((2 ** value * 1000) / 1000) * 1000;

  // Threshold
  if (result <= 1000) return 0;
  if (result > 10000000) return 10000000;

  return result;
}

function reverseCalculateValue(value) {
  const result = Math.log(value / 1000) / Math.log(2);

  // Threshold
  if (result < 0) return 0;
  if (result > 13) return 13.3;

  return result;
}

function valuetext(value) {
  let scaledValue = value;
  if (scaledValue >= 10000000) {
    scaledValue = 10000000;
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
    if (newInputFrom > 10000000) newInputFrom = 10000000;
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
    const defaultValue = [0, 10000000];
    inputValue.current = defaultValue;
    onChange(defaultValue);
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
            max={13.3}
            scale={calculateValue}
            marks={marks}
            valueLabelDisplay={disabledLabel ? "off" : "auto"}
            getAriaValueText={valuetext}
            valueLabelFormat={valuetext}
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
