const SITE_URL = "https://est-fe-13-3st-finalproject.vercel.app";

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export default function SEO({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  url,
  type = "website",
  robots = "index, follow",
}) {
  const canonicalUrl = url ? (url.startsWith("http") ? url : `${SITE_URL}${url}`) : undefined;

  const ogImage = image?.startsWith("http") ? image : `${SITE_URL}${image || "/og-default.png"}`;

  return (
    <>
      {/* 기본 SEO */}
      <title>{title}</title>

      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      {/* 대표 URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph - 카카오톡 등 링크 공유 미리보기 */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${title} 대표 이미지`} />
      <meta property="og:site_name" content="깃깔나는 레시피" />
      <meta property="og:locale" content="ko_KR" />
    </>
  );
}
