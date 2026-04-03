interface ContribFormProps {
  domain: string;
  type?: 'ipartner' | 'contact';
  height?: number;
}

export default function ContribForm({
  domain,
  type = 'ipartner',
  height = 1380,
}: ContribFormProps) {
  const src =
    type === 'contact'
      ? `https://www.domaindirectory.com/servicepage/contactus2_form.php?domain=${domain}`
      : `https://www.contrib.com/forms/ipartner/${domain}`;

  return (
    <div className="w-full flex justify-center">
      <iframe
        src={src}
        width="100%"
        height={height}
        className="rounded-xl"
        style={{ maxWidth: 800, border: 'none', background: '#1A2420' }}
        title={type === 'contact' ? 'Contact Form' : 'Partnership Application'}
        loading="lazy"
        allow="clipboard-write"
      />
    </div>
  );
}
