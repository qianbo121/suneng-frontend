import { PartialType } from '@nestjs/swagger';

import { CreateTimelineEventDto } from '@/modules/about/dto/create-timeline-event.dto';

export class UpdateTimelineEventDto extends PartialType(CreateTimelineEventDto) {}
