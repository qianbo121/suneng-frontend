import { PartialType } from '@nestjs/swagger';

import { CreateSalesOutletDto } from '@/modules/sales-outlet/dto/create-sales-outlet.dto';

export class UpdateSalesOutletDto extends PartialType(CreateSalesOutletDto) {}
