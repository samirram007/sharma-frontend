import { z } from "zod";

export const QuantityTypeEnum = z.enum([
    "measure",
    "volume",
    "weight",
    "length",
    "area",
    "others",
]);


// Quantity Type
export type QuantityType = z.infer<typeof QuantityTypeEnum>;

export const UnitTypeEnum = z.enum([
    "simple",
    "compound"
]);
export type UnitType = z.infer<typeof UnitTypeEnum>;


// TypeOfSupplu
export const TypeOfSupplyEnum = z.enum([
    "capital_goods",
    "goods",
    "services",
]);
export type TypeOfSupply = z.infer<typeof TypeOfSupplyEnum>;

export const StorageUnitTypeEnum = z.enum([
    "FACILITY",
    "WAREHOUSE",
    "GODOWN",
    "BUILDING",
    "FLOOR",
    "ZONE",
    "STORAGE_ROOM",
    "AISLE",
    "RACK",
    "SHELF",
    "BIN",
    "LOCATION",
    "YARD",
    "COURT",
    "MEZZANINE",
    "CONTAINER",
    "TRUCK",
    "TRAILER",
    "VAN",
    "TANKER",
    "SILO",
    "VIRTUAL",
    "IN_TRANSIT",
    "QUARANTINE",
    "DAMAGED",
    "REJECTED",
    "RESERVED",
    "RETURN",
    "HOLD",
    "RAW_MATERIAL",
    "WORK_IN_PROGRESS",
    "FINISHED_GOODS",
    "LINE_SIDE",
    "BUFFER",
    "STAGING",
    "DISPATCH",
    "COLD_ROOM",
    "HAZMAT",
    "SAFE",
    "VAULT",
    "CONTROLLED_ZONE",

]);
export type StorageUnitType = z.infer<typeof StorageUnitTypeEnum>;

export const StorageUnitCategoryEnum = z.enum([
    "physical",
    "mobile",
    "virtual",
    "process",
]);
export type StorageUnitCategory = z.infer<typeof StorageUnitCategoryEnum>;

