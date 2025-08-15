import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { useRecoilState } from 'recoil';
import { useGetBannerQuery } from '~/data-provider';
import store from '~/store';

type GlowOptions = {
  enabled?: boolean;
  from?: string; // CSS color, e.g. 'rgba(99,102,241,0.10)'
  via?: string; // CSS color
  to?: string; // CSS color
  opacity?: number; // 0..1
  blur?: 'xl' | '2xl' | '3xl';
  mask?: string; // CSS mask-image value
  edgeTopOpacity?: number; // 0..1
  edgeBottomOpacity?: number; // 0..1
};

type BannerProps = {
  onHeightChange?: (height: number) => void;
  glow?: GlowOptions;
};

export const Banner = ({ onHeightChange, glow }: BannerProps) => {
  const { data: banner } = useGetBannerQuery();
  const [hideBannerHint, setHideBannerHint] = useRecoilState<string[]>(store.hideBannerHint);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onHeightChange && bannerRef.current) {
      onHeightChange(bannerRef.current.offsetHeight);
    }
  }, [banner, hideBannerHint, onHeightChange]);

  if (!banner || (banner.bannerId && hideBannerHint.includes(banner.bannerId))) {
    return null;
  }

  const onClick = () => {
    setHideBannerHint([...hideBannerHint, banner.bannerId]);
    if (onHeightChange) {
      onHeightChange(0); // Reset height when banner is closed
    }
  };

  const glowCfg: Required<GlowOptions> = useMemo(
    () => ({
      enabled: glow?.enabled ?? true,
      from: glow?.from ?? 'rgba(96,165,250,0.10)', // sky-400/10
      via: glow?.via ?? 'rgba(56,189,248,0.10)', // cyan-400/10
      to: glow?.to ?? 'rgba(96,165,250,0.08)', // sky-400/8 (dezente Ausblendung)
      opacity: glow?.opacity ?? 0.6,
      blur: glow?.blur ?? '2xl',
      mask: glow?.mask ?? 'radial-gradient(60% 120% at 50% 50%, black, transparent)',
      edgeTopOpacity: glow?.edgeTopOpacity ?? 0.2,
      edgeBottomOpacity: glow?.edgeBottomOpacity ?? 0.1,
    }),
    [glow],
  );

  const blurClass = useMemo(() => {
    switch (glowCfg.blur) {
      case 'xl':
        return 'blur-xl';
      case '3xl':
        return 'blur-3xl';
      case '2xl':
      default:
        return 'blur-2xl';
    }
  }, [glowCfg.blur]);

  return (
    <div
      ref={bannerRef}
      className="relative sticky top-0 isolate z-20 flex items-center overflow-visible bg-neutral-900 from-gray-700 to-gray-900 px-2 py-1 text-slate-50 dark:bg-gradient-to-r dark:text-white md:relative"
    >
      {/* Glow backdrop for depth behind the stripe */}
      {glowCfg.enabled && (
        <div aria-hidden className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10">
          <div
            className={`absolute inset-0 ${blurClass}`}
            style={{
              background: `linear-gradient(90deg, ${glowCfg.from}, ${glowCfg.via}, ${glowCfg.to})`,
              opacity: glowCfg.opacity,
              maskImage: glowCfg.mask,
              WebkitMaskImage: glowCfg.mask,
            }}
          />
        </div>
      )}

      {/* Edge lighting for subtle separation from background */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ opacity: glowCfg.edgeTopOpacity }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ opacity: glowCfg.edgeBottomOpacity }}
      />
      <div
        className="w-full truncate px-4 text-center text-sm"
        dangerouslySetInnerHTML={{ __html: banner.message }}
      ></div>
      <button
        type="button"
        aria-label="Dismiss banner"
        className="h-8 w-8 opacity-80 hover:opacity-100"
        onClick={onClick}
      >
        <X className="mx-auto h-4 w-4" />
      </button>
    </div>
  );
};
