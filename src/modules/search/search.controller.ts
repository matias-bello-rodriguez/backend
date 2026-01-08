import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar vehículos' })
  async search(
    @Query('q') query: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Request() req?: any,
  ) {
    if (!query) {
      return [];
    }

    const results = await this.vehiclesService.search(query, sortBy, sortOrder);

    // Guardar en historial
    if (req?.user?.id) {
      const filters = { brand, minPrice, maxPrice };
      await this.searchService.saveSearchHistory(
        req.user.id,
        query,
        results.length,
        filters,
      );
    }

    return results;
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener historial de búsquedas' })
  async getHistory(@Request() req: any, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getSearchHistory(req.user.id, limitNum);
  }

  @Delete('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpiar historial de búsquedas' })
  async clearHistory(@Request() req: any) {
    await this.searchService.clearSearchHistory(req.user.id);
    return { message: 'Historial de búsqueda eliminado' };
  }

  @Delete('history/:query')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar búsqueda específica del historial' })
  async removeFromHistory(@Request() req: any, @Param('query') query: string) {
    await this.searchService.removeSearchFromHistory(req.user.id, query);
    return { message: 'Búsqueda eliminada del historial' };
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener sugerencias de búsqueda' })
  async getSuggestions(
    @Request() req: any,
    @Query('q') prefix: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.searchService.getSearchSuggestions(
      req.user.id,
      prefix,
      limitNum,
    );
  }

  @Get('popular')
  @ApiOperation({ summary: 'Obtener búsquedas populares' })
  async getPopular(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getPopularSearches(limitNum);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de búsqueda' })
  async getStats() {
    const todaySearches = await this.searchService.getTodaySearchStats();
    return {
      todaySearches,
      timestamp: new Date().toISOString(),
    };
  }
}
