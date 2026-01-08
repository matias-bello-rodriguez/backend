import { PartialType } from '@nestjs/swagger';
import { CreateInspectionDto } from './create-inspection.dto';
import { IsOptional } from 'class-validator';

export class UpdateInspectionDto extends PartialType(CreateInspectionDto) {
    @IsOptional()
    answers?: any;

    @IsOptional()
    comments?: any;

    @IsOptional()
    textAnswers?: any;

    @IsOptional()
    mediaUrls?: any;

    @IsOptional()
    cancellationReason?: string;

    @IsOptional()
    observacion?: string;
}
