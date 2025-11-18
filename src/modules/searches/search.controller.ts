import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchJobDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get('')
  async search(@Query() query: SearchJobDto) {
    return this.searchService.search(query);
  }
}
