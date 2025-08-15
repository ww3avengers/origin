import { useMemo } from 'react';
import { useMediaQuery } from '@librechat/client';
import { useOutletContext, Link } from 'react-router-dom';
import { getConfigDefaults, PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ContextType } from '~/common';
import ModelSelector from './Menus/Endpoints/ModelSelector';
import { PresetsMenu, HeaderNewChat, OpenSidebar } from './Menus';
import { useGetStartupConfig } from '~/data-provider';
import ExportAndShareMenu from './ExportAndShareMenu';
import BookmarkMenu from './Menus/BookmarkMenu';
import { TemporaryChat } from './TemporaryChat';
import AddMultiConvo from './AddMultiConvo';
import { useHasAccess, useLocalize } from '~/hooks';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible, setNavVisible } = useOutletContext<ContextType>();
  const localize = useLocalize();
  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const hasAccessToMultiConvo = useHasAccess({
    permissionType: PermissionTypes.MULTI_CONVO,
    permission: Permissions.USE,
  });

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white px-2 py-1.5 font-semibold text-text-primary shadow-sm dark:bg-gray-800 md:px-3 md:py-2">
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div
            className={`flex items-center gap-1.5 transition-all duration-200 ease-in-out md:gap-2 ${
              !navVisible
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none -translate-x-4 opacity-0 md:-translate-x-8'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600">
              <OpenSidebar setNavVisible={setNavVisible} />
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
            <HeaderNewChat />
          </div>
          <div
            className={`flex items-center gap-1.5 transition-all duration-200 ease-in-out md:gap-2 ${
              !navVisible ? 'translate-x-0' : '-translate-x-4 md:-translate-x-8'
            }`}
          >
            <ModelSelector startupConfig={startupConfig} />
            {interfaceConfig.presets === true && interfaceConfig.modelSelect && (
              <div className="hidden sm:block">
                <PresetsMenu />
              </div>
            )}
            {hasAccessToBookmarks === true && <BookmarkMenu />}
            {hasAccessToMultiConvo === true && (
              <div className="hidden sm:block">
                <AddMultiConvo />
              </div>
            )}
            {isSmallScreen && (
              <div className="flex items-center gap-1.5">
                <ExportAndShareMenu
                  isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
                />
                <TemporaryChat />
                {/* Quick Links: Dashboard & Analytics (mobile) */}
                <Link
                  to="/dashboard"
                  className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/60"
                  aria-label={localize('translation:com_ui_dashboard')}
                >
                  {localize('translation:com_ui_dashboard')}
                </Link>
                <Link
                  to="/app/analytics"
                  className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/60"
                  aria-label={localize('translation:com_ui_analytics')}
                >
                  {localize('translation:com_ui_analytics')}
                </Link>
              </div>
            )}
          </div>
        </div>
        {!isSmallScreen && (
          <div className="flex items-center gap-2">
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
            />
            <TemporaryChat />
            {/* Quick Links: Dashboard & Analytics (desktop) */}
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/60"
              aria-label={localize('translation:com_ui_dashboard')}
            >
              {localize('translation:com_ui_dashboard')}
            </Link>
            <Link
              to="/app/analytics"
              className="inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700/60"
              aria-label={localize('translation:com_ui_analytics')}
            >
              {localize('translation:com_ui_analytics')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
