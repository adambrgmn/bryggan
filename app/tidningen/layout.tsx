import { BreadcrumbProvider } from '@/components/Breadcrumbs';
import { Header, HeaderProvider } from '@/components/Header';

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <BreadcrumbProvider>
      <HeaderProvider>
        <div className="relative flex flex-col gap-6">
          <Header profile={{ name: 'Adam Bergman', avatar: null }} />
          <main className="container relative mx-auto px-6">{children}</main>
          <footer></footer>
        </div>
      </HeaderProvider>
    </BreadcrumbProvider>
  );
}
