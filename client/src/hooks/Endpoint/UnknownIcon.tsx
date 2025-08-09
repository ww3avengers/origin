import { memo, useState } from 'react';
import { CustomMinimalIcon, XAIcon } from '@librechat/client';
import { EModelEndpoint, KnownEndpoints } from 'librechat-data-provider';
import { IconContext } from '~/common';
import { cn } from '~/utils';

const knownEndpointAssets: Record<string, string> = {
  [KnownEndpoints.anyscale]: '/assets/anyscale.png',
  [KnownEndpoints.apipie]: '/assets/apipie.png',
  [KnownEndpoints.cohere]: '/assets/cohere.png',
  [KnownEndpoints.deepseek]: '/assets/deepseek.svg',
  [KnownEndpoints.fireworks]: '/assets/fireworks.png',
  // KnownEndpoints.google ist nicht in dieser lib-Version vorhanden – Literal nutzen
  'google': '/assets/google.svg',
  [KnownEndpoints.groq]: '/assets/groq.png',
  [KnownEndpoints.huggingface]: '/assets/huggingface.svg',
  [KnownEndpoints.mistral]: '/assets/mistral.png',
  [KnownEndpoints.mlx]: '/assets/mlx.png',
  [KnownEndpoints.ollama]: '/assets/ollama.png',
  'openai': '/assets/openai.svg',
  [KnownEndpoints.openrouter]: '/assets/openrouter.png',
  [KnownEndpoints.perplexity]: '/assets/perplexity.png',
  'qwen': '/assets/qwen.svg',
  [KnownEndpoints.shuttleai]: '/assets/shuttleai.png',
  [KnownEndpoints['together.ai']]: '/assets/together.png',
  [KnownEndpoints.unify]: '/assets/unify.webp',
  // Non-enum known strings
  anthropic: '/assets/anthropic.svg',
  gemini: '/assets/gemini.svg',
};

const knownEndpointClasses = {
  [KnownEndpoints.cohere]: {
    [IconContext.landing]: 'p-2',
  },
  [KnownEndpoints.xai]: {
    [IconContext.landing]: 'p-2',
  },
};

// Normalize known aliases to existing asset keys
// - "together" (custom endpoint name) should use the existing "together.ai" icon
// - "gateway" (LiteLLM) should reuse the "openrouter" icon style for now
// - "azure-openai" / "azure" map auf OpenAI-Icon
// - "gemini" ggf. auf eigenes Icon oder Google-Icon mappen
const normalizeKnownEndpoint = (endpoint: string): string => {
  const lower = endpoint.toLowerCase();
  if (lower === 'together') {
    return KnownEndpoints['together.ai'];
  }
  if (lower === 'gateway') {
    return KnownEndpoints.openrouter;
  }
  if (lower === 'azure-openai' || lower === 'azure') {
    return 'openai';
  }
  if (lower === 'gemini' || lower === 'google-gemini' || lower === 'googleai') {
    // bevorzugt eigenes gemini-Asset, fallback ist google
    return knownEndpointAssets.gemini ? 'gemini' : 'google';
  }
  return lower;
};

const ImageWithFallback = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return <CustomMinimalIcon className={className} />;
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
};

const getKnownClass = ({
  currentEndpoint,
  context = '',
  className,
}: {
  currentEndpoint: string;
  context?: string;
  className: string;
}) => {
  const normalized = normalizeKnownEndpoint(currentEndpoint);
  if (normalized === KnownEndpoints.openrouter) {
    return className;
  }

  const match = knownEndpointClasses[normalized]?.[context] ?? '';
  const defaultClass = context === IconContext.landing ? '' : className;

  return cn(match, defaultClass);
};

function UnknownIcon({
  className = '',
  endpoint: _endpoint,
  iconURL = '',
  context,
}: {
  iconURL?: string;
  className?: string;
  endpoint?: EModelEndpoint | string | null;
  context?: 'landing' | 'menu-item' | 'nav' | 'message';
}) {
  const endpoint = _endpoint ?? '';
  if (!endpoint) {
    return <CustomMinimalIcon className={className} />;
  }

  const currentEndpoint = normalizeKnownEndpoint(endpoint);

  if (currentEndpoint === KnownEndpoints.xai) {
    return (
      <XAIcon
        className={getKnownClass({
          currentEndpoint,
          context: context,
          className,
        })}
      />
    );
  }

  if (iconURL) {
    return <ImageWithFallback className={className} src={iconURL} alt={`${endpoint} Icon`} />;
  }

  const assetPath: string = knownEndpointAssets[currentEndpoint] ?? '';

  if (!assetPath) {
    return <CustomMinimalIcon className={className} />;
  }

  return (
    <ImageWithFallback
      className={getKnownClass({
        currentEndpoint,
        context: context,
        className,
      })}
      src={assetPath}
      alt={`${currentEndpoint} Icon`}
    />
  );
}

export default memo(UnknownIcon);
