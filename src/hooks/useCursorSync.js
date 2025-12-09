import { useCallback, useState } from 'react';

export default function useCursorSync({ isHost, cursorMode, cursorColor, connRef }) {
  const [isMouseDown, setIsMouseDown] = useState(false);

  const sendCursor = useCallback(
    (e, visible) => {
      if (isHost || !connRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      connRef.current.send({ type: 'cursor', x, y, visible, color: cursorColor });
    },
    [cursorColor, isHost, connRef]
  );

  const handleMouseMove = useCallback(
    e => {
      if (cursorMode === 'always') {
        sendCursor(e, true);
      } else if (cursorMode === 'click' && isMouseDown) {
        sendCursor(e, true);
      }
    },
    [cursorMode, isMouseDown, sendCursor]
  );

  const handleMouseDown = useCallback(
    e => {
      setIsMouseDown(true);
      if (cursorMode === 'click') {
        sendCursor(e, true);
      }
    },
    [cursorMode, sendCursor]
  );

  const handleMouseUp = useCallback(
    e => {
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
