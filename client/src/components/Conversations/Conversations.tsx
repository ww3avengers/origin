import { useMemo, memo, type FC, useCallback, useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { parseISO, isToday } from 'date-fns';
import { useMediaQuery } from '@librechat/client';
import type { TranslationKeys } from '@librechat/client';
import LoadingState from '~/components/ui/LoadingState';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import type { ListRowProps } from 'react-virtualized/dist/es/List';
import { TConversation } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';
import { groupConversationsByDate } from '~/utils';
import Convo from './Convo';

interface ConversationsProps {
  conversations: Array<TConversation | null>;
  moveToTop: () => void;
  toggleNav: () => void;
  containerRef: React.RefObject<HTMLDivElement | List>;
  loadMoreConversations: () => void;
  isLoading: boolean;
  isSearchLoading: boolean;
}

// use centralized LoadingState instead of local LoadingSpinner

const DateLabel: FC<{ groupName: string }> = memo(({ groupName }) => {
  const localize = useLocalize();
  return (
    <div className="mt-2 pl-2 pt-1 text-text-secondary" style={{ fontSize: '0.7rem' }}>
      {localize(groupName as any) || groupName}
    </div>
  );
});

DateLabel.displayName = 'DateLabel';

type FlattenedItem =
  | { type: 'header'; groupName: string }
  | { type: 'convo'; convo: TConversation }
  | { type: 'loading' };

const MemoizedConvo = memo(
  ({
    conversation,
    retainView,
    toggleNav,
    isLatestConvo,
  }: {
    conversation: TConversation;
    retainView: () => void;
    toggleNav: () => void;
    isLatestConvo: boolean;
  }) => {
    return (
      <Convo
        conversation={conversation}
        retainView={retainView}
        toggleNav={toggleNav}
        isLatestConvo={isLatestConvo}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.conversation.conversationId === nextProps.conversation.conversationId &&
      prevProps.conversation.title === nextProps.conversation.title &&
      prevProps.isLatestConvo === nextProps.isLatestConvo &&
      prevProps.conversation.endpoint === nextProps.conversation.endpoint
    );
  },
);

const Conversations: FC<ConversationsProps> = ({
  conversations: rawConversations,
  moveToTop,
  toggleNav,
  containerRef,
  loadMoreConversations,
  isLoading,
  isSearchLoading,
}) => {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const convoHeight = isSmallScreen ? 44 : 34;
  const localize = useLocalize();
  const tr = useCallback((key: string) => localize(key as any) as string, [localize]);

  const filteredConversations = useMemo(
    () => rawConversations.filter(Boolean) as TConversation[],
    [rawConversations],
  );

  const groupedConversations = useMemo(
    () => groupConversationsByDate(filteredConversations),
    [filteredConversations],
  );

  const firstTodayConvoId = useMemo(
    () =>
      filteredConversations.find((convo) => convo.updatedAt && isToday(parseISO(convo.updatedAt)))
        ?.conversationId ?? undefined,
    [filteredConversations],
  );

  const flattenedItems = useMemo(() => {
    const items: FlattenedItem[] = [];
    groupedConversations.forEach(([groupName, convos]) => {
      items.push({ type: 'header', groupName });
      items.push(...convos.map((convo) => ({ type: 'convo' as const, convo })));
    });

    if (isLoading) {
      items.push({ type: 'loading' });
    }
    return items;
  }, [groupedConversations, isLoading]);

  // Positions-Map für ARIA posinset und Gesamtgröße (WeakMap vermeidet string/null Issues)
  const convoPositions = useMemo(() => {
    let pos = 0;
    const map = new WeakMap<TConversation, number>();
    flattenedItems.forEach((it) => {
      if (it.type === 'convo') {
        pos += 1;
        map.set(it.convo, pos);
      }
    });
    return { map, size: pos } as const;
  }, [flattenedItems]);

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: convoHeight,
        keyMapper: (index) => {
          const item = flattenedItems[index];
          if (item.type === 'header') {
            return `header-${index}`;
          }
          if (item.type === 'convo') {
            return `convo-${item.convo.conversationId}`;
          }
          if (item.type === 'loading') {
            return `loading-${index}`;
          }
          return `unknown-${index}`;
        },
      }),
    [flattenedItems, convoHeight],
  );

  const rowRenderer = useCallback(
    ({ index, key, parent, style }: ListRowProps) => {
      const item = flattenedItems[index];
      if (item.type === 'loading') {
        return (
          <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
            {({ registerChild }) => (
              <div ref={registerChild} style={style}>
                <div className="mx-auto mt-2 flex items-center justify-center gap-2">
                  <LoadingState label={localize`com_ui_loading`} />
                </div>
              </div>
            )}
          </CellMeasurer>
        );
      }
      return (
        <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
          {({ registerChild }) => (
            <div ref={registerChild} style={style}>
              {item.type === 'header' ? (
                <DateLabel groupName={item.groupName} />
              ) : item.type === 'convo' ? (
                <div
                  role="listitem"
                  aria-posinset={convoPositions.map.get(item.convo) ?? 1}
                  aria-setsize={convoPositions.size}
                >
                  <MemoizedConvo
                    conversation={item.convo}
                    retainView={moveToTop}
                    toggleNav={toggleNav}
                    isLatestConvo={item.convo.conversationId === firstTodayConvoId}
                  />
                </div>
              ) : null}
            </div>
          )}
        </CellMeasurer>
      );
    },
    [cache, flattenedItems, firstTodayConvoId, moveToTop, toggleNav, convoPositions],
  );

  const getRowHeight = useCallback(
    ({ index }: { index: number }) => cache.getHeight(index, 0),
    [cache],
  );

  const throttledLoadMore = useMemo(
    () => throttle(loadMoreConversations, 300),
    [loadMoreConversations],
  );

  // Cleanup throttled handler to avoid memory leaks
  // and ensure no calls after unmount
  useEffect(() => {
    return () => {
      throttledLoadMore.cancel?.();
    };
  }, [throttledLoadMore]);

  const handleRowsRendered = useCallback(
    ({ stopIndex }: { stopIndex: number }) => {
      if (stopIndex >= flattenedItems.length - 8) {
        throttledLoadMore();
      }
    },
    [flattenedItems.length, throttledLoadMore],
  );

  const noRowsRenderer = useCallback(
    () => (
      <div className="flex h-full items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">{localize`com_ui_empty` || ''}</span>
      </div>
    ),
    [localize],
  );

  // Ensure measurements stay correct when data or row height changes
  useEffect(() => {
    cache.clearAll();
    const refCurrent = containerRef.current as any;
    if (refCurrent && typeof refCurrent.recomputeRowHeights === 'function') {
      refCurrent.recomputeRowHeights();
    }
  }, [cache, containerRef, flattenedItems, convoHeight]);

  // Einmaliges Auto-Scroll auf die erste heutige Konversation
  const didAutoScroll = useRef(false);
  const [scrollToIndex, setScrollToIndex] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (didAutoScroll.current || isLoading || isSearchLoading || !firstTodayConvoId) {
      return;
    }
    const idx = flattenedItems.findIndex(
      (it) => it.type === 'convo' && it.convo.conversationId === firstTodayConvoId,
    );
    if (idx >= 0) {
      setScrollToIndex(idx);
      didAutoScroll.current = true;
    }
  }, [flattenedItems, firstTodayConvoId, isLoading, isSearchLoading]);

  return (
    <div
      className="relative flex h-full flex-col pb-2 text-sm text-text-primary"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 480px' }}
      aria-busy={isLoading || isSearchLoading}
    >
      {isSearchLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingState label={tr('com_ui_loading')} />
        </div>
      ) : (
        <div className="flex-1">
          <AutoSizer>
            {({ width, height }) => (
              <List
                ref={containerRef as React.RefObject<List>}
                width={width}
                height={height}
                deferredMeasurementCache={cache}
                rowCount={flattenedItems.length}
                rowHeight={getRowHeight}
                rowRenderer={rowRenderer}
                overscanRowCount={isSmallScreen ? 8 : 12}
                scrollToIndex={scrollToIndex ?? -1}
                scrollToAlignment="start"
                noRowsRenderer={noRowsRenderer}
                className="outline-none"
                style={{ outline: 'none' }}
                role="list"
                aria-label="Conversations"
                onRowsRendered={handleRowsRendered}
                tabIndex={-1}
              />
            )}
          </AutoSizer>
        </div>
      )}
    </div>
  );
};

export default memo(Conversations);
