import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LanguagePreferenceRepository } from './repositories/language-preference.repository';
import {
  LanguageCode,
  LanguageStatus,
  LanguagePreference,
} from './entities/language-preference.entity';

@Injectable()
export class LanguagePreferencesService {
  constructor(
    private readonly languagePreferenceRepository: LanguagePreferenceRepository,
  ) {}

  async create(
    userId: string,
    data: {
      primaryLanguage: LanguageCode;
      secondaryLanguages?: LanguageCode[];
      region?: string;
      timezone?: string;
      autoTranslate?: boolean;
      interfaceLanguage?: LanguageCode;
    },
  ) {
    const existingPreference = await this.languagePreferenceRepository.findOne({
      where: { userId },
    });

    if (existingPreference) {
      throw new BadRequestException(
        'Language preference already exists for this user',
      );
    }

    const languagePreference = this.languagePreferenceRepository.create({
      ...data,
      userId,
      secondaryLanguages: data.secondaryLanguages || [],
      interfaceLanguage: data.interfaceLanguage || data.primaryLanguage,
      status: LanguageStatus.ACTIVE,
    });

    return this.languagePreferenceRepository.save(languagePreference);
  }

  async update(userId: string, updateData: Partial<LanguagePreference>) {
    const languagePreference = await this.findByUserId(userId);

    Object.assign(languagePreference, updateData);
    return this.languagePreferenceRepository.save(languagePreference);
  }

  async findByUserId(userId: string) {
    const languagePreference = await this.languagePreferenceRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!languagePreference) {
      throw new NotFoundException('Language preference not found');
    }

    return languagePreference;
  }

  async getSupportedLanguages() {
    return Object.values(LanguageCode).map((code) => ({
      code,
      name: this.getLanguageName(code),
      nativeName: this.getNativeLanguageName(code),
    }));
  }

  async getUserLanguages(userId: string) {
    const preference = await this.findByUserId(userId);
    return {
      primary: preference.primaryLanguage,
      secondary: preference.secondaryLanguages,
      interface: preference.interfaceLanguage,
    };
  }

  async addSecondaryLanguage(userId: string, language: LanguageCode) {
    const preference = await this.findByUserId(userId);

    if (preference.primaryLanguage === language) {
      throw new BadRequestException('Cannot add primary language as secondary');
    }

    if (preference.secondaryLanguages.includes(language)) {
      throw new BadRequestException('Language already added as secondary');
    }

    preference.secondaryLanguages.push(language);
    return this.languagePreferenceRepository.save(preference);
  }

  async removeSecondaryLanguage(userId: string, language: LanguageCode) {
    const preference = await this.findByUserId(userId);

    preference.secondaryLanguages = preference.secondaryLanguages.filter(
      (lang) => lang !== language,
    );

    return this.languagePreferenceRepository.save(preference);
  }

  async setInterfaceLanguage(userId: string, language: LanguageCode) {
    const preference = await this.findByUserId(userId);

    // Ensure the language is either primary or secondary
    if (
      preference.primaryLanguage !== language &&
      !preference.secondaryLanguages.includes(language)
    ) {
      throw new BadRequestException('Language not available for this user');
    }

    preference.interfaceLanguage = language;
    return this.languagePreferenceRepository.save(preference);
  }

  async getUsersByLanguage(language: LanguageCode) {
    return this.languagePreferenceRepository.find({
      where: [
        { primaryLanguage: language, status: LanguageStatus.ACTIVE },
        { secondaryLanguages: language, status: LanguageStatus.ACTIVE },
      ],
      relations: ['user'],
    });
  }

  async getTranslationPreferences(userId: string) {
    const preference = await this.findByUserId(userId);
    return {
      autoTranslate: preference.autoTranslate,
      primaryLanguage: preference.primaryLanguage,
      secondaryLanguages: preference.secondaryLanguages,
    };
  }

  async updateNotificationPreferences(
    userId: string,
    primary: boolean,
    secondary: boolean,
  ) {
    const preference = await this.findByUserId(userId);

    preference.receiveNotificationsInPrimary = primary;
    preference.receiveNotificationsInSecondary = secondary;

    return this.languagePreferenceRepository.save(preference);
  }

  async getRegionalPreferences(userId: string) {
    const preference = await this.findByUserId(userId);
    return {
      region: preference.region,
      timezone: preference.timezone,
    };
  }

  private getLanguageName(code: LanguageCode): string {
    const names: Record<LanguageCode, string> = {
      [LanguageCode.EN]: 'English',
      [LanguageCode.HA]: 'Hausa',
      [LanguageCode.YO]: 'Yoruba',
      [LanguageCode.IG]: 'Igbo',
      [LanguageCode.FR]: 'French',
      [LanguageCode.AR]: 'Arabic',
      [LanguageCode.ZH]: 'Chinese',
      [LanguageCode.ES]: 'Spanish',
    };
    return names[code] || code;
  }

  private getNativeLanguageName(code: LanguageCode): string {
    const nativeNames: Record<LanguageCode, string> = {
      [LanguageCode.EN]: 'English',
      [LanguageCode.HA]: 'Hausa',
      [LanguageCode.YO]: 'Yorùbá',
      [LanguageCode.IG]: 'Igbo',
      [LanguageCode.FR]: 'Français',
      [LanguageCode.AR]: 'العربية',
      [LanguageCode.ZH]: '中文',
      [LanguageCode.ES]: 'Español',
    };
    return nativeNames[code] || code;
  }
}
