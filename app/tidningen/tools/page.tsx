import { Download as DownloadIcon, ExternalLink } from 'react-feather';

import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

type Download = {
  kind: 'link' | 'file';
  link: string;
  label: string;
};

export default async function Page() {
  let session = await getAuthorizedSession();

  let downloads: Download[] = [
    {
      kind: 'link',
      link: 'https://github.com/sjofartstidningen/sst-indesign-export/releases',
      label: 'SST InDesign Export',
    },
  ];

  return (
    <div className="flex w-full max-w-[600px] flex-col items-stretch gap-10">
      <Section head={<Title>Nedladdningar</Title>}>
        <ul className="flex gap-4">
          {downloads.map((item) => (
            <li key={item.link}>
              <DownloadLink {...item} />
            </li>
          ))}
        </ul>
      </Section>

      <hr className="border-gray-400" />
    </div>
  );
}

function Section({ head, children }: React.PropsWithChildren<{ head: React.ReactNode }>) {
  return (
    <section>
      <div className="mb-20">{head}</div>
      {children}
    </section>
  );
}

function Title({ children }: React.PropsWithChildren) {
  return <h2 className="mb-1 text-xl font-semibold">{children}</h2>;
}

function DownloadLink({ kind, link, label }: Download) {
  return (
    <a
      href={link}
      download={kind === 'file'}
      target={kind === 'link' ? '_blank' : undefined}
      className="flex h-24 w-24 flex-col items-stretch rounded border border-current text-black hover:text-blue-500"
    >
      <span className="flex flex-1 items-center justify-center" aria-hidden>
        {kind === 'file' ? <DownloadIcon size={24} /> : <ExternalLink size={24} />}
      </span>
      <hr className="border-current" aria-hidden />
      <span className="py-1 text-center text-xs">{label}</span>
    </a>
  );
}
