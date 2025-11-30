import { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface WebcamFeedProps {
  isActive: boolean;
  onFpsUpdate?: (fps: number) => void;
}

const WebcamFeed = ({ isActive, onFpsUpdate }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setHasPermission(false);
      }
    };

    const calculateFps = () => {
      frameCount.current++;
      const now = Date.now();
      const elapsed = now - lastTime.current;
      
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCount.current * 1000) / elapsed);
        setFps(currentFps);
        onFpsUpdate?.(currentFps);
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      if (isActive) {
        animationId = requestAnimationFrame(calculateFps);
      }
    };

    if (isActive) {
      startCamera();
      animationId = requestAnimationFrame(calculateFps);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isActive, onFpsUpdate]);

  // Draw facial landmark overlay (simulated)
  useEffect(() => {
    if (!isActive || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simulated face detection box
      ctx.strokeStyle = 'hsl(187, 100%, 50%)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(140, 80, 360, 320);
      ctx.setLineDash([]);

      // Simulated eye tracking points
      ctx.fillStyle = 'hsl(142, 76%, 45%)';
      const eyePoints = [
        [220, 180], [250, 175], [280, 180], [250, 185], // Left eye
        [360, 180], [390, 175], [420, 180], [390, 185], // Right eye
      ];
      
      eyePoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Face mesh lines (simplified)
      ctx.strokeStyle = 'hsl(187, 100%, 50%)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      // Nose bridge
      ctx.beginPath();
      ctx.moveTo(320, 160);
      ctx.lineTo(320, 280);
      ctx.stroke();

      // Mouth
      ctx.beginPath();
      ctx.moveTo(280, 320);
      ctx.quadraticCurveTo(320, 340, 360, 320);
      ctx.stroke();

      ctx.globalAlpha = 1;

      if (isActive) {
        requestAnimationFrame(drawOverlay);
      }
    };

    drawOverlay();
  }, [isActive]);

  return (
    <div className="relative bg-secondary rounded-lg overflow-hidden">
      {/* Video container with aspect ratio */}
      <div className="relative aspect-[4/3]">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <CameraOff className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-sm">Camera access denied</p>
            <p className="text-xs mt-2 opacity-60">Please allow camera access to use this feature</p>
          </div>
        ) : hasPermission === null && isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Camera className="w-16 h-16 mb-4 opacity-50 animate-pulse" />
            <p className="text-sm">Requesting camera access...</p>
          </div>
        ) : !isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground grid-pattern">
            <Camera className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm opacity-50">Camera inactive</p>
          </div>
        ) : null}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${hasPermission && isActive ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Overlay canvas for landmarks */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className={`absolute inset-0 w-full h-full pointer-events-none ${hasPermission && isActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Scan line effect */}
        {isActive && hasPermission && (
          <div className="absolute inset-0 scan-line pointer-events-none" />
        )}
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isActive && hasPermission && (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-fresh animate-pulse" />
                  <span className="text-status-fresh">LIVE</span>
                </span>
                <span className="text-muted-foreground">640×480</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActive && hasPermission && (
              <span className="font-mono text-primary">{fps} FPS</span>
            )}
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary/50" />
      <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary/50" />
      <div className="absolute bottom-10 left-2 w-6 h-6 border-l-2 border-b-2 border-primary/50" />
      <div className="absolute bottom-10 right-2 w-6 h-6 border-r-2 border-b-2 border-primary/50" />
    </div>
  );
};

export default WebcamFeed;
