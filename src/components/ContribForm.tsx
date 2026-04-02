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
        style={{ maxWidth: 800, border: 'none', background: '#f5f5f5' }}
        title={type === 'contact' ? 'Contact Form' : 'Partnership Application'}
        loading="lazy"
      />
    </div>
  );
}
