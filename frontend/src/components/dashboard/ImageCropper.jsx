import React, { useState, useRef, useEffect } from "react";
import { FiX, FiZoomIn, FiZoomOut, FiRotateCw } from "react-icons/fi";

export default function ImageCropper({ imageSrc, onCrop, onCancel }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);
  const [rotation, setRotation] = useState(0);

  const CROP_SIZE = 300;
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Center the image initially
        const containerWidth = containerRef.current?.clientWidth || CROP_SIZE;
        const containerHeight = containerRef.current?.clientHeight || CROP_SIZE;
        const initialScale = Math.max(
          CROP_SIZE / img.width,
          CROP_SIZE / img.height
        );
        setScale(initialScale);
        setPosition({
          x: (containerWidth - img.width) / 2,
          y: (containerHeight - img.height) / 2,
        });
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, MIN_SCALE));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    ctx.save();
    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-CROP_SIZE / 2, -CROP_SIZE / 2);

    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const centerX = position.x + (image.width / 2);
    const centerY = position.y + (image.height / 2);
    const offsetX = centerX - (imgWidth / 2);
    const offsetY = centerY - (imgHeight / 2);

    ctx.drawImage(image, offsetX, offsetY, imgWidth, imgHeight);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    onCrop(croppedDataUrl);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.08]">
          <h3 className="text-lg font-bold text-[#0c0407]">Crop Profile Picture</h3>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-xl bg-[#fafafa] text-[#0c0407] flex items-center justify-center cursor-pointer border border-black/[0.08] hover:bg-[#f1f5f9] transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div
            ref={containerRef}
            className="relative mx-auto bg-[#f1f5f9] rounded-full overflow-hidden cursor-move select-none"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {image && (
              <img
                src={imageSrc}
                alt="Crop"
                className="absolute"
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${image.width}px`,
                  height: `${image.height}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            )}
            {/* Crop overlay */}
            <div className="absolute inset-0 border-4 border-white/50 rounded-full pointer-events-none" />
            <div className="absolute inset-0 border-2 border-[#fc362d] rounded-full pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-xl bg-[#fafafa] text-[#0c0407] flex items-center justify-center cursor-pointer border border-black/[0.08] hover:bg-[#f1f5f9] transition-all"
              disabled={scale <= MIN_SCALE}
            >
              <FiZoomOut className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-[#94a3b8]">
              {Math.round(scale * 100)}%
            </div>
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-xl bg-[#fafafa] text-[#0c0407] flex items-center justify-center cursor-pointer border border-black/[0.08] hover:bg-[#f1f5f9] transition-all"
              disabled={scale >= MAX_SCALE}
            >
              <FiZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="w-10 h-10 rounded-xl bg-[#fafafa] text-[#0c0407] flex items-center justify-center cursor-pointer border border-black/[0.08] hover:bg-[#f1f5f9] transition-all"
            >
              <FiRotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/[0.08] bg-[#fafafa]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#475569] hover:bg-white transition-all cursor-pointer border border-black/[0.08]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all cursor-pointer"
          >
            Crop & Save
          </button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
