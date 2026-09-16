import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

const UNKNOWN = 'unknown' as const;
const SAFE_CUSTOMER_TEXT = /^(?!.*javascript:)[^<>]*$/i;

function isConcrete(value: unknown) {
  return value !== undefined && value !== null && value !== UNKNOWN;
}

export class WorkpieceRouterRawConditionsDto {
  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(120)
  materialFamily?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(120)
  materialGrade?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(160)
  applicableStandard?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(200)
  drawingRequirement?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(200)
  weldingProcedure?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(240)
  processRequirement?: string | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  maximumThickness?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  dimensionLength?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  dimensionWidth?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  dimensionHeight?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  dimensionDiameter?: number | typeof UNKNOWN | null;

  @IsOptional()
  @IsIn(['mm', 'cm', 'm', UNKNOWN])
  dimensionUnit?: 'mm' | 'cm' | 'm' | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000_000)
  singlePieceWeightKg?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000_000)
  fixtureWeightKg?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000_000)
  batchLoadWeightKg?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-1_000_000)
  @Max(1_000_000)
  centerOfGravityX?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-1_000_000)
  @Max(1_000_000)
  centerOfGravityY?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  centerOfGravityZ?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  supportSpanMm?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  shaftEquivalentSectionMm?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  shaftSlendernessRatio?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(1_000_000)
  allowableDeflectionMm?: number | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  horizontalLoadingAllowed?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(1)
  @Max(100)
  supportPointCount?: number | typeof UNKNOWN | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(240)
  supportPointLayout?: string | null;

  @IsOptional()
  @IsIn(['discrete_part', 'plate', 'long_product', 'coil', 'strip', 'irregular_assembly', UNKNOWN])
  partForm?: string | null;

  @IsOptional()
  @IsIn(['horizontal', 'vertical', 'flat', 'suspended', UNKNOWN])
  loadingOrientation?: string | null;

  @IsOptional()
  @IsIn(['coiled', 'uncoiled', 'stacked', 'single_piece', 'bulk_loaded', UNKNOWN])
  presentationState?: string | null;

  @IsOptional()
  @IsIn(['stationary', 'through_process', 'either', UNKNOWN])
  loadMovement?: string | null;

  @IsOptional()
  @IsIn(['crane_or_forklift', 'conveyor_feed', 'manual_or_basket', UNKNOWN])
  loadingAccess?: string | null;

  @IsOptional()
  @IsIn([
    'broad_base',
    'line_contact',
    'distributed_small_parts',
    'fixture_required',
    'no_base_support',
    UNKNOWN,
  ])
  baseSupportCondition?: string | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  continuousContactAllowed?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  floorLoadingRequired?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  suspensionAllowed?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  stackingAllowed?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  bulkLoadingSuitable?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @IsIn(['small', 'medium', 'large', UNKNOWN])
  batchSize?: string | null;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', UNKNOWN])
  targetThroughput?: string | null;

  @IsOptional()
  @IsIn(['stable', 'few_variants', 'high_mix', UNKNOWN])
  productMix?: string | null;

  @IsOptional()
  @IsIn(['rare', 'periodic', 'frequent', UNKNOWN])
  changeoverFrequency?: string | null;

  @IsOptional()
  @IsIn(['flexible', 'regular', 'tight', UNKNOWN])
  cycleTimeExpectation?: string | null;

  @IsOptional()
  @IsIn(['discrete', 'intermittent', 'continuous', UNKNOWN])
  loadingContinuity?: string | null;

  @IsOptional()
  @IsIn(['batch', 'continuous', 'no_preference', UNKNOWN])
  operationPreference?: string | null;

  @IsOptional()
  @IsIn([
    'air',
    'inert',
    'reducing',
    'protective',
    'controlled_carbon_potential',
    'controlled_carbon_nitrogen_potential',
    UNKNOWN,
  ])
  atmosphereType?: string | null;

  @IsOptional()
  @IsIn(['normal', 'low_oxidation', 'bright', 'scale_controlled', UNKNOWN])
  surfaceObjective?: string | null;

  @IsOptional()
  @IsIn(['whole_component', 'local', 'field', UNKNOWN])
  treatmentScope?: string | null;

  @IsOptional()
  @IsIn(['strict', 'controlled', 'standard', UNKNOWN])
  distortionConstraint?: string | null;

  @IsOptional()
  @IsIn(['after_quench', 'after_normalizing', 'other_defined', 'none', UNKNOWN])
  priorHeatTreatmentState?: string | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(200)
  temperingPurpose?: string | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  drawingOrProcessCardConfirmed?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @IsIn(['standalone_tempering', 'quench_temper_full_chain', UNKNOWN])
  treatmentChainMode?: string | null;

  @IsOptional()
  @IsIn(['whole_pipe', 'online_weld_seam', 'local_induction', UNKNOWN])
  pipeTreatmentScope?: string | null;

  @IsOptional()
  @IsIn(['coiled_batch', 'uncoiled_continuous', UNKNOWN])
  coilProcessingForm?: string | null;

  @IsOptional()
  @IsIn(['uncoated', 'coated', 'clad', UNKNOWN])
  coatingState?: string | null;

  @IsOptional()
  @IsIn(['homogeneous', 'composite', 'overlay', 'coated', UNKNOWN])
  wearPlateConstruction?: string | null;

  @IsOptional()
  @IsIn(['carbon_or_alloy_steel', 'stainless_steel', 'nonferrous', UNKNOWN])
  fastenerMaterialClass?: string | null;

  @IsOptional()
  @IsIn(['plain_hex', 'insert', 'self_locking', 'welded_assembly', 'other', UNKNOWN])
  nutConstruction?: string | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  wholeComponentQuenchTemper?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  quenchRequired?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @IsString()
  @Matches(SAFE_CUSTOMER_TEXT)
  @MaxLength(80)
  quenchMedium?: string | null;

  @IsOptional()
  @IsIn(['rapid', 'bounded', 'no_special_constraint', UNKNOWN])
  transferConstraint?: string | null;

  @IsOptional()
  @IsIn(['rapid', 'controlled', 'standard', UNKNOWN])
  coolingRateRequirement?: string | null;

  @IsOptional()
  @IsIn(['required', 'not_required', UNKNOWN])
  agitationOrFlowRequirement?: string | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  austenitizing?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  transfer?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  quench?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  tempering?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  final_cooling?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  solution_heating?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  rapid_transfer?: boolean | typeof UNKNOWN | null;

  @IsOptional()
  @ValidateIf((_object, value) => isConcrete(value))
  @IsBoolean()
  rapid_cooling?: boolean | typeof UNKNOWN | null;
}

export class ResolveWorkpieceRouterDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,79}$/)
  workpieceId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{1,79}$/)
  processPurposeId!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WorkpieceRouterRawConditionsDto)
  rawConditions!: WorkpieceRouterRawConditionsDto;
}
