import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DataType, sendMessageParams } from './interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/getList')
  getList(): { data: DataType[] } {
    return this.appService.getList();
  }

  @Post('/api/postMessage')
  postMessage(@Body() data: sendMessageParams): { code: number } {
    return this.appService.postMessage(data);
  }
}
