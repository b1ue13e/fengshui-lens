import Link from 'next/link';
import { Compass, Sparkles, BarChart3 } from 'lucide-react';

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        
        {/* 左侧 Logo 区 */}
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="font-bold tracking-tighter text-lg md:text-xl">
              FengShui <span className="text-primary">Lens</span>
            </span>
          </Link>
        </div>

        {/* 右侧导航区 */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/evaluate" 
            className="flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">开始算卦</span>
          </Link>
          
          <Link 
            href="/dev/metrics" 
            className="hidden md:flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
          >
            <BarChart3 className="h-4 w-4" />
            <span>引擎面板</span>
          </Link>
          
          {/* 视觉重心按钮：霓虹边框发光 */}
          <Link 
            href="/report" 
            className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-md border border-primary/50 bg-primary/10 px-4 py-2 font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <span className="relative z-10">历史卷宗</span>
            {/* 悬停时的光晕动画 */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </nav>

      </div>
    </header>
  );
}
