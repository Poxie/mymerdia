import { useTranslation } from 'next-i18next';
import styles from '../../../styles/Language.module.scss';
import { SettingsHeader } from "../SettingsHeader"
import { SettingsSection } from '../SettingsSection';
import { DisplayLanguage } from './DisplayLanguage';

export const Language = () => {
    const { t } = useTranslation('settings');
    return(
        <div className={styles['container']}>
            <SettingsHeader>
                {t('language.header')}
            </SettingsHeader>
            <SettingsSection title={t('language.displayLanguage')}>
                <DisplayLanguage />
            </SettingsSection>
        </div>
    )
}