import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailTemplateDto } from './dto/create-template.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('templates')
  getAllTemplate() {
    return this.emailService.getAllTemplate();
  }

  @Post('templates')
  createEmail(@Body() payload: CreateEmailTemplateDto) {
    return this.emailService.create(payload);
  }
}
