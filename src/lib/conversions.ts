/**
 * Unit conversion data + logic for the calculator's Converter section.
 * Each category is a list of units; conversion happens through a canonical
 * "base" unit so arbitrary pairs convert cleanly.
 */

export type UnitConversion = (value: number) => number

export interface ConversionUnit {
  id: string
  label: string
  /** Short display symbol, e.g. "m", "kg", "°C". */
  symbol: string
  toBase?: UnitConversion
  fromBase?: UnitConversion
}

export interface ConversionCategory {
  id: string
  label: string
  units: ConversionUnit[]
}

/** Linear unit: `value × factor` yields the category's base unit. */
const linear = (
  factor: number,
  symbol: string,
  id?: string,
  label?: string,
) => ({
  id: id ?? symbol,
  label: label ?? symbol,
  symbol,
  toBase: (value: number) => value * factor,
  fromBase: (value: number) => value / factor,
})

const BASE = (symbol: string): ConversionUnit => ({
  id: symbol,
  label: symbol,
  symbol,
  toBase: (value: number) => value,
  fromBase: (value: number) => value,
})

/**
 * Static reference rates per 1 USD (indicative, not live). Currency is
 * included so the converter works offline; live rates would need a service.
 */
const CURRENCY_USD: Array<{ id: string; label: string; perUsd: number }> = [
  { id: 'USD', label: 'US Dollar', perUsd: 1 },
  { id: 'EUR', label: 'Euro', perUsd: 0.92 },
  { id: 'GBP', label: 'British Pound', perUsd: 0.79 },
  { id: 'INR', label: 'Indian Rupee', perUsd: 84.0 },
  { id: 'JPY', label: 'Japanese Yen', perUsd: 154.0 },
  { id: 'CNY', label: 'Chinese Yuan', perUsd: 7.24 },
  { id: 'AUD', label: 'Australian Dollar', perUsd: 1.53 },
  { id: 'CAD', label: 'Canadian Dollar', perUsd: 1.36 },
  { id: 'CHF', label: 'Swiss Franc', perUsd: 0.85 },
  { id: 'SGD', label: 'Singapore Dollar', perUsd: 1.34 },
  { id: 'AED', label: 'UAE Dirham', perUsd: 3.67 },
  { id: 'SAR', label: 'Saudi Riyal', perUsd: 3.75 },
]

const CATEGORIES: ConversionCategory[] = [
  {
    id: 'currency',
    label: 'Currency',
    units: CURRENCY_USD.map((currency) => ({
      id: currency.id,
      label: `${currency.label} (${currency.id})`,
      symbol: currency.id,
      toBase: (value) => value / currency.perUsd,
      fromBase: (value) => value * currency.perUsd,
    })),
  },
  {
    id: 'volume',
    label: 'Volume',
    units: [
      BASE('L'),
      linear(0.001, 'mL'),
      linear(1000, 'm³'),
      linear(1, 'cm³'),
      linear(3.785411784, 'gal', 'gal-us', 'US gallon'),
      linear(0.946352946, 'qt', 'qt-us', 'US quart'),
      linear(0.473176473, 'pt', 'pt-us', 'US pint'),
      linear(0.2365882365, 'cup', 'cup-us', 'US cup'),
      linear(0.02957352956, 'fl oz', 'fl-oz-us', 'US fluid ounce'),
      linear(0.01478676478, 'tbsp', 'tbsp-us', 'US tablespoon'),
      linear(0.004928921594, 'tsp', 'tsp-us', 'US teaspoon'),
      linear(28.316846592, 'ft³'),
      linear(0.016387064, 'in³'),
      linear(158.987294928, 'bbl', 'bbl-oil', 'oil barrel'),
    ],
  },
  {
    id: 'length',
    label: 'Length',
    units: [
      BASE('m'),
      linear(1000, 'km'),
      linear(0.01, 'cm'),
      linear(0.001, 'mm'),
      linear(0.000001, 'µm'),
      linear(1609.344, 'mi', 'mi', 'mile'),
      linear(0.9144, 'yd'),
      linear(0.3048, 'ft'),
      linear(0.0254, 'in'),
      linear(1852, 'nmi', 'nmi', 'nautical mile'),
    ],
  },
  {
    id: 'weight',
    label: 'Weight and mass',
    units: [
      BASE('kg'),
      linear(0.001, 'g'),
      linear(0.000001, 'mg'),
      linear(1000, 't', 't', 'metric ton'),
      linear(0.45359237, 'lb'),
      linear(0.028349523125, 'oz'),
      linear(6.35029318, 'st', 'st', 'stone'),
      linear(907.18474, 'ton', 'ton-us', 'US ton'),
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    units: [
      {
        id: 'c',
        label: 'Celsius',
        symbol: '°C',
        toBase: (value) => value, // base = °C
        fromBase: (value) => value,
      },
      {
        id: 'f',
        label: 'Fahrenheit',
        symbol: '°F',
        toBase: (value) => ((value - 32) * 5) / 9,
        fromBase: (value) => (value * 9) / 5 + 32,
      },
      {
        id: 'k',
        label: 'Kelvin',
        symbol: 'K',
        toBase: (value) => value - 273.15,
        fromBase: (value) => value + 273.15,
      },
      {
        id: 'r',
        label: 'Rankine',
        symbol: '°R',
        toBase: (value) => ((value - 491.67) * 5) / 9,
        fromBase: (value) => (value * 9) / 5 + 491.67,
      },
    ],
  },
  {
    id: 'energy',
    label: 'Energy',
    units: [
      BASE('J'),
      linear(1000, 'kJ'),
      linear(4.184, 'cal'),
      linear(4184, 'kcal'),
      linear(3600000, 'kWh'),
      linear(3600, 'Wh'),
      linear(1055.05585262, 'BTU'),
      linear(1.602176634e-19, 'eV'),
      linear(0.0000001, 'erg'),
    ],
  },
  {
    id: 'area',
    label: 'Area',
    units: [
      BASE('m²'),
      linear(1000000, 'km²'),
      linear(0.0001, 'cm²'),
      linear(10000, 'ha', 'ha', 'hectare'),
      linear(4046.8564224, 'acre'),
      linear(0.09290304, 'ft²'),
      linear(0.00064516, 'in²'),
      linear(0.83612736, 'yd²'),
      linear(2589988.110336, 'mi²'),
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    units: [
      BASE('m/s'),
      linear(1 / 3.6, 'km/h'),
      linear(1 / 2.2369362921, 'mph'),
      linear(1 / 1.9438444924, 'kn', 'kn', 'knot'),
      linear(0.3048, 'ft/s'),
    ],
  },
  {
    id: 'time',
    label: 'Time',
    units: [
      BASE('s'),
      linear(0.001, 'ms'),
      linear(60, 'min'),
      linear(3600, 'h'),
      linear(86400, 'day'),
      linear(604800, 'week'),
      linear(2629800, 'month', 'month', 'month (avg)'),
      linear(31557600, 'year', 'year', 'year (avg)'),
    ],
  },
  {
    id: 'power',
    label: 'Power',
    units: [
      BASE('W'),
      linear(1000, 'kW'),
      linear(1000000, 'MW'),
      linear(735.49875, 'hp', 'hp-metric', 'metric horsepower'),
      linear(745.699871582, 'hp-imp', 'hp-imp', 'imperial horsepower'),
      linear(0.29307107017, 'BTU/h'),
    ],
  },
  {
    id: 'data',
    label: 'Data',
    units: [
      BASE('B'),
      linear(0.125, 'bit'),
      linear(1024, 'KiB'),
      linear(1048576, 'MiB'),
      linear(1073741824, 'GiB'),
      linear(1099511627776, 'TiB'),
      linear(1000, 'kB'),
      linear(1000000, 'MB'),
      linear(1000000000, 'GB'),
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure',
    units: [
      BASE('Pa'),
      linear(1000, 'kPa'),
      linear(1000000, 'MPa'),
      linear(100000, 'bar'),
      linear(101325, 'atm'),
      linear(6894.757293168, 'psi'),
      linear(133.322387415, 'mmHg'),
      linear(133.322368421, 'torr'),
    ],
  },
  {
    id: 'angle',
    label: 'Angle',
    units: [
      linear(1, 'rad'),
      linear(Math.PI / 180, 'deg', 'deg', 'degree'),
      linear(Math.PI / 200, 'grad', 'grad', 'gradian'),
      linear(Math.PI / 10800, 'arcmin', 'arcmin', 'arc minute'),
      linear(Math.PI / 648000, 'arcsec', 'arcsec', 'arc second'),
      linear(2 * Math.PI, 'turn', 'turn', 'turn'),
    ],
  },
]

export const CONVERSION_CATEGORIES: ReadonlyArray<ConversionCategory> =
  CATEGORIES

export function getConversionCategory(
  id: string,
): ConversionCategory | undefined {
  return CATEGORIES.find((category) => category.id === id)
}

function unitOf(category: ConversionCategory, id: string): ConversionUnit {
  const unit = category.units.find((candidate) => candidate.id === id)
  if (!unit) throw new Error(`Unknown unit "${id}" in ${category.id}`)
  return unit
}

/** Convert `value` between two units of the same category. */
export function convertUnit(
  categoryId: string,
  fromUnitId: string,
  toUnitId: string,
  value: number,
): number {
  const category = getConversionCategory(categoryId)
  if (!category) throw new Error(`Unknown category "${categoryId}"`)
  const from = unitOf(category, fromUnitId)
  const to = unitOf(category, toUnitId)
  if (from === to) return value
  const baseValue = from.toBase?.(value) ?? value
  return to.fromBase?.(baseValue) ?? baseValue
}
