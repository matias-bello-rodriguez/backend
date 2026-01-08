import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../../entities/SearchHistory.entity';
import { CreateSearchHistoryDto } from './dto/create-search-history.dto';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
  ) {}

  async create(userId: string, dto: CreateSearchHistoryDto): Promise<SearchHistory> {
    const searchHistory = this.searchHistoryRepository.create({
      usuarioId: userId,
      ...dto,
    });
    return await this.searchHistoryRepository.save(searchHistory);
  }

  async getUserHistory(userId: string, limit: number = 20): Promise<SearchHistory[]> {
    return await this.searchHistoryRepository.find({
      where: { usuarioId: userId },
      order: { fechaBusqueda: 'DESC' },
      take: limit,
    });
  }

  async getPopularSearches(limit: number = 10): Promise<any[]> {
    return await this.searchHistoryRepository
      .createQueryBuilder('sh')
      .select('sh.marca', 'marca')
      .addSelect('COUNT(*)', 'count')
      .where('sh.marca IS NOT NULL')
      .groupBy('sh.marca')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getRecentSearchTerms(userId: string, limit: number = 5): Promise<string[]> {
    const results = await this.searchHistoryRepository
      .createQueryBuilder('sh')
      .select('sh.terminoBusqueda', 'termino')
      .where('sh.usuarioId = :userId', { userId })
      .andWhere('sh.terminoBusqueda IS NOT NULL')
      .andWhere("sh.terminoBusqueda != ''")
      .groupBy('sh.terminoBusqueda')
      .orderBy('MAX(sh.fechaBusqueda)', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(r => r.termino);
  }

  async clearUserHistory(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ usuarioId: userId });
  }

  async getSearchStats(userId: string): Promise<any> {
    const total = await this.searchHistoryRepository.count({
      where: { usuarioId: userId },
    });

    const topMarca = await this.searchHistoryRepository
      .createQueryBuilder('sh')
      .select('sh.marca', 'marca')
      .addSelect('COUNT(*)', 'count')
      .where('sh.usuarioId = :userId', { userId })
      .andWhere('sh.marca IS NOT NULL')
      .groupBy('sh.marca')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return {
      totalSearches: total,
      topMarca: topMarca?.marca || null,
      topMarcaCount: parseInt(topMarca?.count) || 0,
    };
  }
}
