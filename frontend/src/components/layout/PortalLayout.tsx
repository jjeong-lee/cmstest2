import { Compass, ExternalLink } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

const navItems = [
  { to: '/', label: 'Portal Home', exact: true },
  { to: '/admin', label: 'Admin' },
];

export function PortalLayout() {
  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-40 rounded-2xl border bg-background/95 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Compass className="size-5" />
              </div>
              <div>
                <NavLink className="text-lg font-semibold tracking-tight" to="/">
                  Markdown CMS
                </NavLink>
                <p className="text-sm text-muted-foreground">발행 문서를 검색하고 읽는 포털</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <nav className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-secondary text-foreground',
                      )
                    }
                    end={item.exact}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Public knowledge</Badge>
                <NavLink
                  className="hidden items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
                  to="/admin"
                >
                  Admin 바로가기
                  <ExternalLink className="size-4" />
                </NavLink>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
