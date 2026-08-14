export default function SEO({
  title,
  description,
  image,
  robots = "index, follow",
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {image && <meta property="og:image" content={image} />}
    </>
  );
}