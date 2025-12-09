import { useCallback, useEffect, useRef, useState } from 'react';

export default function useVideoControls(stream, onLog) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPiP, setIsPiP] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => onLog?.('Video playing successfully'))
        .catch(e => onLog?.(`Error playing video: ${e.message}`));
    } else {
      videoRef.current.srcObject = null;
    }
  }, [stream, onLog]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const videoEl = videoRef.current;
    const handlePiPEnter = () => setIsPiP(true);
    const handlePiPLeave = () => setIsPiP(false);

    if (videoEl) {
      videoEl.addEventListener('enterpictureinpicture', handlePiPEnter);
      videoEl.addEventListener('leavepictureinpicture', handlePiPLeave);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (videoEl) {
        videoEl.removeEventListener('enterpictureinpicture', handlePiPEnter);
        videoEl.removeEventListener('leavepictureinpicture', handlePiPLeave);
      }
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(err => {
        onLog?.(`Error enabling full-screen: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [onLog]);

  const togglePiP = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      onLog?.(`Error with PiP: ${error}`);
    }
  }, [onLog]);

  const manualPlay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current
      .play()
      .then(() => onLog?.('Manual play successful'))
      .catch(e => onLog?.(`Manual play failed: ${e.message}`));
  }, [onLog]);

  return { videoRef, containerRef, isPiP, isFullscreen, toggleFullscreen, togglePiP, manualPlay };
}
