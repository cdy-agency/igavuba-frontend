'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Square,
  Circle,
  Copy,
  ChevronDown,
  Layers,
  Minus,
  Diamond,
  Triangle,
  Hexagon,
  Pentagon,
  Heart,
  Star,
  ArrowRight,
  Check,
  Plus as PlusIcon,
  Lock,
  Unlock,
} from 'lucide-react';
import { CertificateElementType, TextAlign, type CertificateElement } from '@/types/certificate';
import { loadGoogleFont } from '@/lib/loadGoogleFont';
import { Input } from '@/components/ui/input';
import { GOOGLE_FONT_OPTIONS } from '@/utils/google-fonts';

interface FloatingToolbarProps {
  element: CertificateElement;
  elementRect: DOMRect;
  canvasRect: DOMRect;
  onUpdate: (updates: Partial<CertificateElement>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onCopy: () => void;
  onUnlock?: () => void;
  totalLayers: number;
  isEditing: boolean;
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

// Shape options with icons and border radius values
const SHAPE_OPTIONS = [
  { icon: Square, label: 'Square', borderRadius: 0 },
  { icon: Circle, label: 'Circle', borderRadius: 50 },
  { icon: Diamond, label: 'Diamond', borderRadius: 2, rotation: 45 },
  { icon: Triangle, label: 'Triangle', borderRadius: 0 },
  { icon: Hexagon, label: 'Hexagon', borderRadius: 0 },
  { icon: Pentagon, label: 'Pentagon', borderRadius: 0 },
  { icon: Heart, label: 'Heart', borderRadius: 0 },
  { icon: Star, label: 'Star', borderRadius: 0 },
  { icon: ArrowRight, label: 'Arrow', borderRadius: 0 },
  { icon: Check, label: 'Check', borderRadius: 0 },
  { icon: PlusIcon, label: 'Plus', borderRadius: 0 },
];

export function FloatingToolbar({
  element,
  elementRect,
  canvasRect,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onCopy,
  onUnlock,
}: FloatingToolbarProps) {
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [fontSearch, setFontSearch] = useState('');
  const fontPickerRef = useRef<HTMLDivElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);
  const shapePickerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState({ width: 0, height: 0 });

  const currentFont = element.textStyle?.fontFamily || 'Montserrat';
  const currentSize = element.textStyle?.fontSize || 14;
  const currentColor = element.textStyle?.color || '#000000';
  const currentAlign = element.textStyle?.textAlign || 'center';
  const currentBold = element.textStyle?.fontWeight === 'bold';
  const currentItalic = element.textStyle?.fontStyle === 'italic';
  const currentBorderRadius = element.borderRadius || 0;

  // Load Google font
  useEffect(() => {
    if (currentFont) loadGoogleFont(currentFont);
  }, [currentFont]);

  // Click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(e.target as Node))
        setShowFontPicker(false);
      if (sizePickerRef.current && !sizePickerRef.current.contains(e.target as Node))
        setShowSizePicker(false);
      if (shapePickerRef.current && !shapePickerRef.current.contains(e.target as Node))
        setShowShapePicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFonts = GOOGLE_FONT_OPTIONS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase()),
  );

  // Handlers
  const handleFontChange = (font: string) => {
    loadGoogleFont(font);
    onUpdate({ textStyle: { ...element.textStyle, fontFamily: font } });
    setShowFontPicker(false);
    setFontSearch('');
  };

  const handleSizeChange = (size: number) => {
    onUpdate({ textStyle: { ...element.textStyle, fontSize: size } });
    setShowSizePicker(false);
  };

  const handleColorChange = (color: string) => {
    onUpdate({ textStyle: { ...element.textStyle, color } });
  };

  const handleAlignChange = (align: TextAlign) => {
    onUpdate({ textStyle: { ...element.textStyle, textAlign: align } });
  };

  const handleBoldToggle = () => {
    onUpdate({
      textStyle: { ...element.textStyle, fontWeight: currentBold ? 'normal' : 'bold' },
    });
  };

  const handleItalicToggle = () => {
    onUpdate({
      textStyle: { ...element.textStyle, fontStyle: currentItalic ? 'normal' : 'italic' },
    });
  };

  const handleShapeChange = (borderRadius: number) => {
    onUpdate({ borderRadius });
    setShowShapePicker(false);
  };

  const handleFillColorChange = (color: string) => {
    onUpdate({ fillColor: color });
  };

  // Get current shape icon
  const getCurrentShapeIcon = () => {
    if (currentBorderRadius >= 50) return Circle;
    return Square;
  };

  const ALIGN_BUTTONS: { align: TextAlign; Icon: React.ElementType }[] = [
    { align: 'left', Icon: AlignLeft },
    { align: 'center', Icon: AlignCenter },
    { align: 'right', Icon: AlignRight },
  ];

  const CurrentShapeIcon = getCurrentShapeIcon();

  const renderToolbarContent = () => {
    switch (element.type) {
      case CertificateElementType.TEXT:
      case CertificateElementType.CODE:
      case CertificateElementType.DATE:
      case CertificateElementType.STUDENT_NAME:
      case CertificateElementType.STUDENT_CODE:
      case CertificateElementType.COURSE_NAME:
      case CertificateElementType.COURSE_DETAILS:
      case CertificateElementType.COURSE_PROGRESS:
      case CertificateElementType.COURSE_DURATION:
      case CertificateElementType.COURSE_START_DATE:
      case CertificateElementType.COURSE_END_DATE:
      case CertificateElementType.INSTRUCTOR_NAME:
      case CertificateElementType.CO_INSTRUCTOR_NAME:
        return (
          <div className="flex flex-col gap-1.5">
            {/* Row 1: Font Family + Font Size */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={fontPickerRef}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFontPicker(!showFontPicker);
                    setShowSizePicker(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-[140px] justify-between"
                >
                  <span className="truncate" style={{ fontFamily: currentFont }}>
                    {currentFont}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500" />
                </button>
                {showFontPicker && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-auto z-[10000]">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                      <Input
                        type="text"
                        placeholder="Search fonts..."
                        value={fontSearch}
                        onChange={(e) => setFontSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredFonts.map((f) => (
                        <button
                          key={f}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => loadGoogleFont(f)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFontChange(f);
                          }}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-gray-100 ${
                            currentFont === f ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                          style={{ fontFamily: f }}
                        >
                          <span className="truncate">{f}</span>
                          <span className="text-[11px] text-gray-400 tracking-wide">AaBb</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Font Size Picker */}
              <div className="relative" ref={sizePickerRef}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSizePicker(!showSizePicker);
                    setShowFontPicker(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-[80px] justify-between"
                >
                  <span>{currentSize}px</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-500" />
                </button>
                {showSizePicker && (
                  <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto z-[10000]">
                    {FONT_SIZES.map((size) => (
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        key={size}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSizeChange(size);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${currentSize === size ? 'bg-blue-50 text-blue-600' : ''}`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Color + Alignment + Bold + Italic */}
            <div className="flex items-center gap-2">
              {/* Color Picker - Circular */}
              <div
                className="w-9 h-9 rounded-full border-2 border-gray-400 cursor-pointer relative overflow-hidden flex-shrink-0"
                style={{ backgroundColor: currentColor }}
              >
                <input
                  type="color"
                  value={currentColor}
                  onMouseDown={(e) => e.preventDefault()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleColorChange(e.target.value);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Text Color"
                />
              </div>

              {/* Alignment Buttons - with active state */}
              {ALIGN_BUTTONS.map(({ align, Icon }) => (
                <button
                  key={align}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlignChange(align);
                  }}
                  className={`p-2 rounded-md border transition-colors ${
                    currentAlign === align
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 hover:bg-gray-100 text-gray-700'
                  }`}
                  title={`Align ${align}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}

              {/* Bold Button */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBoldToggle();
                }}
                className={`w-9 h-9 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors font-bold text-base bg-white flex items-center justify-center ${currentBold ? 'bg-blue-100 border-blue-400 text-blue-600' : 'text-gray-700'}`}
                title="Bold"
              >
                B
              </button>

              {/* Italic Button */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItalicToggle();
                }}
                className={`w-9 h-9 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors italic font-serif text-base bg-white flex items-center justify-center ${currentItalic ? 'bg-blue-100 border-blue-400 text-blue-600' : 'text-gray-700'}`}
                title="Italic"
              >
                I
              </button>

              {/* Delete Button */}
              <div className="rounded-md p-1 ml-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 rounded cursor-pointer hover:bg-gray-200 text-white transition-colors"
                  title="Delete"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        );

      case CertificateElementType.SHAPE:
        return (
          <div className="flex items-center gap-2">
            {/* Fill Color Picker - Circle */}
            <div
              className="w-9 h-9 rounded-full border-2 border-gray-400 cursor-pointer relative overflow-hidden flex-shrink-0"
              style={{ backgroundColor: element.fillColor || '#9ca3af' }}
            >
              <input
                type="color"
                value={element.fillColor || '#9ca3af'}
                onMouseDown={(e) => e.preventDefault()}
                onChange={(e) => {
                  e.stopPropagation();
                  handleFillColorChange(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Fill Color"
              />
            </div>

            {/* Shape Picker Dropdown */}
            <div className="relative" ref={shapePickerRef}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShapePicker(!showShapePicker);
                }}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors bg-blue-500 text-white"
                title="Shape Type"
              >
                <CurrentShapeIcon className="w-4 h-4" />
              </button>
              {showShapePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-2 z-[10000] grid grid-cols-4 gap-1 w-[200px]">
                  {SHAPE_OPTIONS.map(({ icon: Icon, label, borderRadius }) => (
                    <button
                      key={label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShapeChange(borderRadius);
                      }}
                      className={`p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center ${
                        (borderRadius === 0 && currentBorderRadius === 0) ||
                        (borderRadius >= 50 && currentBorderRadius >= 50)
                          ? 'bg-blue-100 border border-blue-400'
                          : ''
                      }`}
                      title={label}
                    >
                      <Icon className="w-5 h-5 text-blue-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Minus (Send Backward) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onSendBackward();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
              title="Send Backward"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Layer indicator with icon */}
            <button
              className="p-2 rounded-md border border-gray-300 bg-white"
              disabled
              title="Current Layer"
            >
              <Layers className="w-4 h-4 text-gray-700" />
            </button>

            {/* Layer number */}
            <div className="flex items-center justify-center min-w-[32px] h-9 px-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md bg-white">
              {element.zIndex || 1}
            </div>

            {/* Plus (Bring Forward) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onBringForward();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
              title="Bring Forward"
            >
              <span className="text-lg font-bold">+</span>
            </button>

            {/* Copy Button */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Lock/Unlock Button */}
            {onUnlock && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
                title={
                  element.locked ? 'Unlock element to edit' : 'Lock element to prevent editing'
                }
              >
                {element.locked ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-600" />
                )}
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors bg-white"
              title="Delete"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        );

      // IMAGE and QR_CODE
      case CertificateElementType.IMAGE:
      case CertificateElementType.QR_CODE:
        return (
          <div className="flex items-center gap-2">
            {/* Minus (Send Backward) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onSendBackward();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
              title="Send Backward"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Layer indicator with icon */}
            <button
              className="p-2 rounded-md border border-gray-300 bg-white"
              disabled
              title="Current Layer"
            >
              <Layers className="w-4 h-4 text-gray-700" />
            </button>

            {/* Layer number */}
            <div className="flex items-center justify-center min-w-[32px] h-9 px-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md bg-white">
              {element.zIndex || 1}
            </div>

            {/* Plus (Bring Forward) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onBringForward();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
              title="Bring Forward"
            >
              <span className="text-lg font-bold">+</span>
            </button>

            {/* Lock/Unlock Button */}
            {onUnlock && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors bg-white"
                title={
                  element.locked ? 'Unlock element to edit' : 'Lock element to prevent editing'
                }
              >
                {element.locked ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-600" />
                )}
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors bg-white"
              title="Delete"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Measure actual toolbar size when mounted/updated so we can align tightly
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setMeasured({ width: r.width, height: r.height });
    });
    ro.observe(el);
    // initial measure
    const r = el.getBoundingClientRect();
    setMeasured({ width: r.width, height: r.height });
    return () => ro.disconnect();
  }, [showFontPicker, showSizePicker, showShapePicker, fontSearch]);

  // Always place toolbar above the element (centered horizontally), clamped to the visible canvas.
  // If the element is too close to the top, clamp it to the top gap instead of jumping below.
  const GAP = 24;
  const toolbarWidth = measured.width || 340;
  const toolbarHeight = measured.height || 80;
  const centeredAbove = elementRect.left + elementRect.width / 2 - toolbarWidth / 2;

  let computedLeft = Math.max(
    canvasRect.left + GAP,
    Math.min(centeredAbove, canvasRect.right - toolbarWidth - GAP),
  );
  let computedTop = elementRect.top - toolbarHeight - GAP;

  if (canvasRect) {
    // Keep the toolbar above the element with a gap, even if space is tight.
    // If the element is too close to the top, clamp the toolbar to the top edge instead of moving it below.
    computedTop = Math.max(canvasRect.top + GAP, computedTop);

    // Horizontal clamp is already applied above, but keep a second safeguard.
    computedLeft = Math.max(
      canvasRect.left + GAP,
      Math.min(computedLeft, canvasRect.right - toolbarWidth - GAP),
    );

    // Vertical clamp to avoid going outside the bottom edge of the canvas.
    if (computedTop + toolbarHeight > canvasRect.bottom - GAP) {
      computedTop = Math.max(canvasRect.top + GAP, canvasRect.bottom - toolbarHeight - GAP);
    }
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: computedTop,
    left: computedLeft,
    zIndex: 9999,
  };

  const toolbarElement = (
    <div
      ref={toolbarRef}
      className="bg-white border border-gray-400 rounded-lg shadow-lg px-2 py-2 z-[9999]"
      style={toolbarStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {renderToolbarContent()}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(toolbarElement, document.body) : null;
}
