import { Injectable, Logger } from '@nestjs/common';
import { LawReportRepository } from './repositories/law-report.repository';
import {
  ReportCategory,
  ReportJurisdiction,
} from './entities/law-report.entity';

@Injectable()
export class LawReportsService {
  private readonly logger = new Logger(LawReportsService.name);

  constructor(private readonly lawReportRepository: LawReportRepository) {}

  async searchReports(
    query: string,
    filters?: {
      category?: ReportCategory;
      jurisdiction?: ReportJurisdiction;
      court?: string;
      startDate?: Date;
      endDate?: Date;
      language?: string;
    },
  ) {
    const queryBuilder = this.lawReportRepository.createQueryBuilder('report');

    if (query) {
      queryBuilder.where(
        '(report.title ILIKE :query OR report.summary ILIKE :query OR report.citation ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (filters?.category) {
      queryBuilder.andWhere('report.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.jurisdiction) {
      queryBuilder.andWhere('report.jurisdiction = :jurisdiction', {
        jurisdiction: filters.jurisdiction,
      });
    }

    if (filters?.court) {
      queryBuilder.andWhere('report.court ILIKE :court', {
        court: `%${filters.court}%`,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('report.decisionDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('report.decisionDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.language) {
      queryBuilder.andWhere('report.language = :language', {
        language: filters.language,
      });
    }

    queryBuilder.orderBy('report.decisionDate', 'DESC');

    return queryBuilder.getMany();
  }

  async getRecentReports(limit: number = 10) {
    return this.lawReportRepository.find({
      order: { decisionDate: 'DESC' },
      take: limit,
    });
  }

  async getReportsByCategory(category: ReportCategory, limit: number = 20) {
    return this.lawReportRepository.find({
      where: { category },
      order: { decisionDate: 'DESC' },
      take: limit,
    });
  }

  async getReportsByJurisdiction(
    jurisdiction: ReportJurisdiction,
    limit: number = 20,
  ) {
    return this.lawReportRepository.find({
      where: { jurisdiction },
      order: { decisionDate: 'DESC' },
      take: limit,
    });
  }

  async getReportById(reportId: string) {
    const report = await this.lawReportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Law report not found');
    }

    return report;
  }

  async getRelatedReports(reportId: string, limit: number = 5) {
    const report = await this.getReportById(reportId);

    return this.lawReportRepository.find({
      where: [
        { category: report.category },
        { jurisdiction: report.jurisdiction },
      ],
      relations: [],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPopularTags() {
    const reports = await this.lawReportRepository.find({
      where: {},
      select: ['tags'],
    });

    const allTags = reports
      .filter((report) => report.tags && report.tags.length > 0)
      .flatMap((report) => report.tags || []);

    const tagCounts = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  async seedSampleReports() {
    const sampleReports: Partial<any>[] = [
      {
        title:
          'Contract Law: Formation and Consideration in Commercial Agreements',
        citation: 'SC/123/2024',
        summary:
          'Supreme Court decision on contract formation requirements and consideration in commercial agreements. The court emphasized the importance of offer, acceptance, and consideration in contract formation.',
        category: 'CONTRACT_LAW',
        jurisdiction: 'NIGERIA',
        court: 'Supreme Court of Nigeria',
        decisionDate: new Date('2024-01-15'),
        judge: 'Hon. Justice Ibrahim Tanko Muhammad',
        parties: 'ABC Company Ltd v. XYZ Corporation',
        headnotes:
          'Contract formation requires offer, acceptance, and consideration. Electronic contracts are valid when properly authenticated.',
        ratioDecidendi:
          'A contract is only enforceable when there is a valid offer, acceptance, and consideration. Electronic signatures are admissible in evidence.',
        language: 'en',
        tags: [
          'contract',
          'formation',
          'consideration',
          'electronic contracts',
        ],
      },
      {
        title:
          'Property Law: Adverse Possession Claims and Statutory Requirements',
        citation: 'CA/L/456/2023',
        summary:
          'Court of Appeal ruling on adverse possession claims and statutory requirements. The court clarified the elements needed to establish adverse possession.',
        category: 'PROPERTY_LAW',
        jurisdiction: 'LAGOS',
        court: 'Court of Appeal Lagos Division',
        decisionDate: new Date('2023-08-20'),
        judge: 'Hon. Justice Uzo Ndukwe-Anyanwu',
        parties: 'Estate of Late Chief Adebayo v. Mr. Olusegun Adeyemi',
        headnotes:
          'Adverse possession requires open, continuous, and exclusive possession for the statutory period.',
        ratioDecidendi:
          "To establish adverse possession, the claimant must prove open, continuous, and exclusive possession for the statutory period without the owner's permission.",
        language: 'en',
        tags: [
          'property',
          'adverse possession',
          'land law',
          'statutory requirements',
        ],
      },
      {
        title: 'Employment Law: Wrongful Termination and Employee Rights',
        citation: 'IC/789/2024',
        summary:
          'Industrial Court decision on wrongful termination and employee rights. The court upheld the principle of fair hearing in employment termination.',
        category: 'EMPLOYMENT_LAW',
        jurisdiction: 'NIGERIA',
        court: 'National Industrial Court of Nigeria',
        decisionDate: new Date('2024-02-10'),
        judge: 'Hon. Justice Benedict Kanyip',
        parties: 'Mrs. Fatima Hassan v. Global Industries Ltd',
        headnotes:
          'Employers must follow due process and give fair hearing before terminating employment.',
        ratioDecidendi:
          'Employment termination without following due process and fair hearing is wrongful and entitles the employee to damages.',
        language: 'en',
        tags: [
          'employment',
          'wrongful termination',
          'fair hearing',
          'employee rights',
        ],
      },
      {
        title:
          'Criminal Law: Electronic Evidence Admissibility in Criminal Proceedings',
        citation: 'SC/321/2023',
        summary:
          'Supreme Court ruling on electronic evidence admissibility in criminal proceedings. The court established guidelines for authenticating electronic evidence.',
        category: 'CRIMINAL_LAW',
        jurisdiction: 'NIGERIA',
        court: 'Supreme Court of Nigeria',
        decisionDate: new Date('2023-11-05'),
        judge: 'Hon. Justice Olukayode Ariwoola',
        parties: 'Federal Republic of Nigeria v. Mr. Chukwudi Okonkwo',
        headnotes:
          'Electronic evidence is admissible when properly authenticated and meets the requirements of the Evidence Act.',
        ratioDecidendi:
          'Electronic evidence, including digital communications and records, is admissible in criminal proceedings when properly authenticated and meets the requirements of the Evidence Act.',
        language: 'en',
        tags: [
          'criminal law',
          'electronic evidence',
          'admissibility',
          'authentication',
        ],
      },
    ];

    for (const reportData of sampleReports) {
      const existingReport = await this.lawReportRepository.findOne({
        where: { citation: reportData.citation },
      });

      if (!existingReport) {
        const report = this.lawReportRepository.create(reportData);
        await this.lawReportRepository.save(report);
        this.logger.log(`Seeded law report: ${report.title}`);
      }
    }
  }
}
