import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
}

const SEOHelmet = ({
    title,
    description,
    keywords = 'chat, messaging, secure messaging, real-time chat',
    ogTitle,
    ogDescription,
    ogImage = '/og-image.png',
    canonicalUrl,
}: SEOHelmetProps) => {
    const finalOgTitle = ogTitle || title;
    const finalOgDescription = ogDescription || description;

    return (
        <Helmet>

            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            <meta property="og:type" content="website" />
            <meta property="og:title" content={finalOgTitle} />
            <meta property="og:description" content={finalOgDescription} />
            <meta property="og:image" content={ogImage} />

            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={finalOgTitle} />
            <meta property="twitter:description" content={finalOgDescription} />
            <meta property="twitter:image" content={ogImage} />

            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            <meta name="theme-color" content="#6D28D9" />
        </Helmet>
    );
};

export default SEOHelmet;
