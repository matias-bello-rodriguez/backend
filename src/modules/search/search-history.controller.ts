import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Req, 
  UseGuards, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchHistoryService } from './search-history.service';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';

@ApiTags('Search History')
@Controller('search-history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Guardar búsqueda en historial' })
  async create(@Req() req, @Body() dto: CreateSearchHistoryDto) {
    return await this.searchHistoryService.create(req.user.id, dto);
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Obtener historial de búsquedas del usuario' })
  async getMyHistory(
    @Req() req,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.searchHistoryService.getUserHistory(req.user.id, limit);
  }

  @Get('recent-terms')
  @ApiOperation({ summary: 'Obtener términos de búsqueda recientes' })
  async getRecentTerms(
    @Req() req,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return await this.searchHistoryService.getRecentSearchTerms(req.user.id, limit);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Obtener búsquedas populares por marca' })
  async getPopular(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return await this.searchHistoryService.getPopularSearches(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de búsqueda del usuario' })
  async getStats(@Req() req) {
    return await this.searchHistoryService.getSearchStats(req.user.id);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Limpiar historial de búsquedas' })
  async clearHistory(@Req() req) {
    await this.searchHistoryService.clearUserHistory(req.user.id);
    return { message: 'Historial eliminado exitosamente' };
  }
}
