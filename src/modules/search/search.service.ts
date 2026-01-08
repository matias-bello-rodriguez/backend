import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../../entities/SearchHistory.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async saveSearchHistory(
    userId: string,
    query: string,
    resultCount: number = 0,
    filters?: Record<string, any>,
  ): Promise<void> {
    const searchHistory = this.searchHistoryRepository.create({
      usuarioId: userId,
      terminoBusqueda: query.toLowerCase().trim(),
      resultadosEncontrados: resultCount,
      precioMin: filters?.precioMin,
      precioMax: filters?.precioMax,
      anioMin: filters?.anioMin,
      anioMax: filters?.anioMax,
      marca: filters?.marca,
      transmision: filters?.transmision,
      combustible: filters?.combustible,
    });

    await this.searchHistoryRepository.save(searchHistory);

    // Mantener solo los últimos 50 registros por usuario
    const count = await this.searchHistoryRepository.count({
      where: { usuarioId: userId },
    });

    if (count > 50) {
      const oldestRecords = await this.searchHistoryRepository.find({
        where: { usuarioId: userId },
        order: { fechaBusqueda: 'ASC' },
        take: count - 50,
      });

      await this.searchHistoryRepository.remove(oldestRecords);
    }
  }

  async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    const history = await this.searchHistoryRepository.find({
      where: { usuarioId: userId },
      order: { fechaBusqueda: 'DESC' },
      take: limit,
    });

    return history.map((h) => ({
      query: h.terminoBusqueda,
      timestamp: h.fechaBusqueda,
      resultCount: h.resultadosEncontrados,
      filters: {
        precioMin: h.precioMin,
        precioMax: h.precioMax,
        anioMin: h.anioMin,
        anioMax: h.anioMax,
        marca: h.marca,
        transmision: h.transmision,
        combustible: h.combustible,
      },
    }));
  }

  async clearSearchHistory(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ usuarioId: userId });
  }

  async removeSearchFromHistory(userId: string, query: string): Promise<void> {
    await this.searchHistoryRepository.delete({
      usuarioId: userId,
      terminoBusqueda: query.toLowerCase().trim(),
    });
  }

  async getSearchSuggestions(
    userId: string,
    prefix: string,
    limit: number = 5,
  ): Promise<string[]> {
    const suggestions = await this.searchHistoryRepository
      .createQueryBuilder('history')
      .select('DISTINCT history.terminoBusqueda', 'terminoBusqueda')
      .where('history.usuarioId = :userId', { userId })
      .andWhere('history.terminoBusqueda LIKE :prefix', {
        prefix: `${prefix.toLowerCase()}%`,
      })
      .orderBy('history.fechaBusqueda', 'DESC')
      .limit(limit)
      .getRawMany();

    return suggestions.map((s) => s.terminoBusqueda);
  }

  async getPopularSearches(limit: number = 10): Promise<any[]> {
    const popular = await this.searchHistoryRepository
      .createQueryBuilder('history')
      .select('history.terminoBusqueda', 'query')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.terminoBusqueda')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return popular;
  }

  async getTodaySearchStats(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.searchHistoryRepository.count({
      where: {
        fechaBusqueda: today,
      },
    });
  }
}
