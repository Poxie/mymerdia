import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { Account } from "../../components/settings/account/Account";
import { SettingsLayout } from "../../layouts/settings/SettingsLayout";
import { NextPageWithLayout } from "../_app";

const AccountPage: NextPageWithLayout = () => {
    const { t } = useTranslation('settings');

    const title = t('account.header') + ` - ${process.env.NEXT_PUBLIC_WEBSITE_NAME}`;
    return(
        <>
        <Head>
            <title>
                {title}
            </title>
            <meta property="og:site_name" content={process.env.NEXT_PUBLIC_WEBSITE_NAME} />
            <meta property="og:url" content={`${process.env.NEXT_PUBLIC_WEBSITE_ORIGIN}/settings/account`} />
        </Head>
    
        <Account />
        </>
    )
}

AccountPage.getLayout = page => (
    <SettingsLayout>
        {page}
    </SettingsLayout>
)

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale || process.env.NEXT_PUBLIC_DEFAULT_LOCALE, ['common', 'settings']))
    }
})

export default AccountPage;