import { useCallback, useState, type MouseEvent as ReactMouseEvent, type MutableRefObject } from 'react';
import type { DataConnection } from 'peerjs';

export type CursorMode = 'always' | 'click';

export default function useCursorSync({
  isHost,
  cursorMode,
  cursorColor,
  connRef,
}: {
  isHost: boolean | null;
  cursorMode: CursorMode;
  cursorColor: string;
  connRef: MutableRefObject<DataConnection | null>;
}) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const sendCursor = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>, visible: boolean) => {
      if (isHost || !connRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      connRef.current.send({ type: 'cursor', x, y, visible, color: cursorColor });
    },
    [cursorColor, isHost, connRef]
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (cursorMode === 'always') {
        sendCursor(e, true);
      } else if (cursorMode === 'click' && isMouseDown) {
        sendCursor(e, true);
      }
    },
    [cursorMode, isMouseDown, sendCursor]
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      setIsMouseDown(true);
      if (cursorMode === 'click') {
        sendCursor(e, true);
      }
    },
    [cursorMode, sendCursor]
  );

  const handleMouseUp = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      setIsMouseDown(false);
      if (cursorMode === 'click') {
        sendCursor(e, false);
      }
    },
    [cursorMode, sendCursor]
  );

  const handleMouseLeave = useCallback(() => {
    if (isHost) return;
    if (connRef.current) {
      connRef.current.send({ type: 'cursor', visible: false });
    }
  }, [isHost, connRef]);

  return { handleMouseMove, handleMouseDown, handleMouseUp, handleMouseLeave };
}
