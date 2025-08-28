import { Module } from '@nestjs/common';
import { LanguagePreferencesService } from './language-preferences.service';
import { LanguagePreferenceRepository } from './repositories/language-preference.repository';

@Module({
  providers: [LanguagePreferencesService, LanguagePreferenceRepository],
  exports: [LanguagePreferencesService],
})
export class LanguagePreferencesModule {}
