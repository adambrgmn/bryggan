import { BreadcrumbProvider } from '@/components/Breadcrumbs';
import { Header, HeaderProvider } from '@/components/Header';
import { md5 } from '@/lib/utils/md5';
import { getAuthorizedSession } from '@/pages/api/auth/[...nextauth]';

import { RefreshAuth } from './RefreshAuth';

export default async function Layout({ children }: React.PropsWithChildren) {
  let session = await getAuthorizedSession();

  return (
    <BreadcrumbProvider>
      <HeaderProvider>
        <RefreshAuth />
        <div className="relative flex flex-col gap-6">
          <Header profile={session.user} hashedEmail={md5(session.user.email)} />
          <main className="container relative mx-auto mb-16 px-6">{children}</main>
        </div>
      </HeaderProvider>
    </BreadcrumbProvider>
  );
}
