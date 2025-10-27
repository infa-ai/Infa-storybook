import React, { useState, useRef, useEffect } from "react";

// Simple loading spinner component
const LoadingSpinner: React.FC<{ description?: string }> = ({
  description,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        border: "2px solid rgba(0, 0, 0, 0.1)",
        borderTopColor: "#333333",
        borderRadius: "50%",
        animation: "spinner-rotate 0.8s linear infinite",
      }}
    />
    {description && (
      <span style={{ fontSize: "13px", color: "#757575" }}>{description}</span>
    )}
  </div>
);

type ImagePreviewType = "component" | "page";
type ImagePreviewMode = "preview" | "edit";

// Type for a single image source, whether server or local
export interface ImageSource {
  url: string;
  section?: number; // Optional section number for multi-section screenshots
}

export interface ImagePreviewProps {
  // Server-side image sources (loaded from the server)
  serverImageSources?: ImageSource[];
  // Local image sources (captured but not yet uploaded)
  localImageSources?: ImageSource[];
  // Placeholder image during upload/processing (base64)
  placeholderImagePreview?: string;
  // HTML content to render instead of images (for full-element fidelity mode)
  htmlContent?: string;
  // Element dimensions from the selected element (for consistent sizing between screenshots and HTML)
  elementDimensions?: { width: number; height: number };
  // Type of screenshot - affects layout and behavior
  type?: ImagePreviewType;
  // Mode - preview or edit
  mode?: ImagePreviewMode;
  // Loading state
  isLoading?: boolean;
  // Level of the component - affects background color (0=gray-100, 1=gray-90)
  level?: 0 | 1;
  // Custom placeholder component to show when no image source is available
  placeholderContent?: React.ReactNode;
  // Custom component to show at the bottom left corner (e.g., ProLabel, upload progress, or errors)
  statusContent?: React.ReactNode;
  // Custom component to show at the top right corner (e.g., controls, actions)
  controlsContent?: React.ReactNode;
  // Event handler for when image is clicked
  onImageClick?: () => void;
  // Event handler for when placeholder content is clicked (when no images are available)
  onPlaceholderClick?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  serverImageSources,
  localImageSources,
  placeholderImagePreview,
  htmlContent,
  elementDimensions,
  type = "component",
  mode = "preview",
  isLoading = false,
  level = 0,
  placeholderContent,
  statusContent,
  controlsContent,
  onImageClick,
  onPlaceholderClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaceholderHovered, setIsPlaceholderHovered] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [cursorPosition, setCursorPosition] = useState({
    x: 0,
    y: 0,
    relativeX: 0,
    relativeY: 0,
  });
  const [serverImagesLoaded, setServerImagesLoaded] = useState(false);
  const [localImagesLoaded, setLocalImagesLoaded] = useState(false);
  const [htmlContentRefReady, setHtmlContentRefReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const htmlContentRef = useRef<HTMLDivElement>(null);

  // Detect if the device has a retina display
  const isRetina = window.devicePixelRatio > 1;

  // Determine which image sources to use for calculations and display
  const hasServerImages = serverImageSources && serverImageSources.length > 0;
  const hasLocalImages = localImageSources && localImageSources.length > 0;
  const hasHtmlContent = htmlContent && htmlContent.trim().length > 0;

  // Debug logging for image display logic (can be removed in production)
  //

  // Define the sources for different display scenarios
  // For single image preview, prioritize server -> local -> placeholder
  const singleDisplaySource = hasServerImages
    ? serverImageSources[0].url
    : hasLocalImages
      ? localImageSources[0].url
      : placeholderImagePreview;

  // For multi-section display, prioritize server -> local
  const multiSectionSources = hasServerImages
    ? serverImageSources
    : hasLocalImages
      ? localImageSources
      : undefined;

  // Extra padding to make corners more accessible (in pixels)
  const EDGE_PADDING = 48;
  // Padding percentage (as decimal) - this affects how much of the container is considered "edge area"
  const EDGE_PERCENT = 0.35; // 35% of the container on each edge

  // Spacing constants in pixels
  const DEFAULT_SPACING = 4;
  const ZOOMED_SPACING = 24;

  // Calculate the fit scale for the image
  const calculateFitScale = () => {
    if (dimensions.width === 0 || dimensions.height === 0) return 1;

    // Apply spacing adjustments to container dimensions
    const spacing = isHovered ? ZOOMED_SPACING : DEFAULT_SPACING;
    const adjustedContainerWidth = containerDimensions.width - spacing * 2;
    const adjustedContainerHeight = containerDimensions.height - spacing * 2;

    return Math.min(
      adjustedContainerWidth / dimensions.width,
      adjustedContainerHeight / dimensions.height,
      1,
    );
  };

  // Calculate centered position for the scaled image
  const calculateCenteredPosition = () => {
    if (dimensions.width === 0 || containerDimensions.width === 0)
      return { x: 0, y: 0 };

    const fitScale = calculateFitScale();
    const scaledWidth = dimensions.width * fitScale;
    const scaledHeight = dimensions.height * fitScale;

    // Apply spacing adjustments
    // const spacing = isHovered ? ZOOMED_SPACING : DEFAULT_SPACING;

    // Center the scaled image with spacing
    const x = (containerDimensions.width - scaledWidth) / 2;
    const y = (containerDimensions.height - scaledHeight) / 2;

    return { x, y };
  };

  // Check if the image is smaller than the container
  const isImageSmallerThanContainer = () => {
    // Apply spacing adjustments to container dimensions
    const spacing = isHovered ? ZOOMED_SPACING : DEFAULT_SPACING;
    const adjustedContainerWidth = containerDimensions.width - spacing * 2;
    const adjustedContainerHeight = containerDimensions.height - spacing * 2;

    return (
      dimensions.width <= adjustedContainerWidth &&
      dimensions.height <= adjustedContainerHeight
    );
  };

  // Calculate scale and position
  const fitScale = calculateFitScale();
  const centeredPosition = calculateCenteredPosition();
  const smallerThanContainer = isImageSmallerThanContainer();

  // Calculate the transform origin based on image size
  const transformOrigin = smallerThanContainer ? "center center" : "top left";

  // Get the cursor edge area (currently unused but kept for future enhancements)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEdgeArea = (cursorX: number, cursorY: number) => {
    const { width, height } = containerDimensions;

    // Thresholds for detecting edge areas
    const leftEdge = width * EDGE_PERCENT;
    const rightEdge = width * (1 - EDGE_PERCENT);
    const topEdge = height * EDGE_PERCENT;
    const bottomEdge = height * (1 - EDGE_PERCENT);

    const isLeftEdge = cursorX < leftEdge;
    const isRightEdge = cursorX > rightEdge;
    const isTopEdge = cursorY < topEdge;
    const isBottomEdge = cursorY > bottomEdge;

    return {
      isLeftEdge,
      isRightEdge,
      isTopEdge,
      isBottomEdge,
    };
  };

  // Calculate image position
  const calculateImagePosition = () => {
    // Check if image is smaller than container - if so, always center it
    if (
      smallerThanContainer ||
      dimensions.width === 0 ||
      dimensions.height === 0
    ) {
      return {
        x: (containerDimensions.width - dimensions.width) / 2,
        y: (containerDimensions.height - dimensions.height) / 2,
      };
    }

    if (!isHovered) {
      // Use the centered position for non-hovered state too
      return centeredPosition;
    }

    // Apply spacing adjustments
    const spacing = isHovered ? ZOOMED_SPACING : DEFAULT_SPACING;
    const adjustedContainerWidth = containerDimensions.width - spacing * 2;
    const adjustedContainerHeight = containerDimensions.height - spacing * 2;

    // Calculate maximum offsets with spacing
    const maxOffsetX = Math.max(0, dimensions.width - adjustedContainerWidth);
    const maxOffsetY = Math.max(0, dimensions.height - adjustedContainerHeight);

    // When hovered and image larger than container, calculate offset with edge detection
    // Note: Edge detection variables are calculated but not used in current implementation
    // const { isLeftEdge, isRightEdge, isTopEdge, isBottomEdge } =
    //     getEdgeArea(cursorPosition.x, cursorPosition.y);

    // Calculate the effective padding as a ratio of container dimensions
    // Use both pixel and percentage-based padding, whichever is larger
    const pixelPaddingX = EDGE_PADDING / containerDimensions.width;
    const pixelPaddingY = EDGE_PADDING / containerDimensions.height;

    const effectivePaddingX = Math.min(
      Math.max(pixelPaddingX, EDGE_PERCENT),
      0.4,
    );
    const effectivePaddingY = Math.min(
      Math.max(pixelPaddingY, EDGE_PERCENT),
      0.4,
    );

    let paddedRelativeX, paddedRelativeY;

    // Calculate padded relative positions based on cursor
    const relativeX = Math.max(
      0,
      Math.min(1, cursorPosition.x / containerDimensions.width),
    );
    const relativeY = Math.max(
      0,
      Math.min(1, cursorPosition.y / containerDimensions.height),
    );

    // Calculate padded relative positions
    if (relativeX < effectivePaddingX) {
      // If in left edge zone, map to show the very left of the image (0)
      paddedRelativeX = 0;
    } else if (relativeX > 1 - effectivePaddingX) {
      // If in right edge zone, map to show the very right of the image (1)
      paddedRelativeX = 1;
    } else {
      // For the middle area, map proportionally from left to right
      paddedRelativeX =
        (relativeX - effectivePaddingX) / (1 - 2 * effectivePaddingX);
    }

    if (relativeY < effectivePaddingY) {
      // If in top edge zone, map to show the very top of the image (0)
      paddedRelativeY = 0;
    } else if (relativeY > 1 - effectivePaddingY) {
      // If in bottom edge zone, map to show the very bottom of the image (1)
      paddedRelativeY = 1;
    } else {
      // For the middle area, map proportionally from top to bottom
      paddedRelativeY =
        (relativeY - effectivePaddingY) / (1 - 2 * effectivePaddingY);
    }

    // Apply the position mapping with spacing adjustment
    const newX =
      -maxOffsetX * paddedRelativeX +
      (maxOffsetX > 0
        ? spacing
        : (containerDimensions.width - dimensions.width) / 2);
    const newY =
      -maxOffsetY * paddedRelativeY +
      (maxOffsetY > 0
        ? spacing
        : (containerDimensions.height - dimensions.height) / 2);

    return {
      x: newX,
      y: newY,
    };
  };

  // Calculate real-time image position based on current cursor position
  const imagePosition = isHovered
    ? calculateImagePosition()
    : {
        x: centeredPosition.x,
        y: centeredPosition.y,
      };

  // Mouse event handlers
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPosition({
      x,
      y,
      relativeX: Math.min(Math.max(x / rect.width, 0), 1),
      relativeY: Math.min(Math.max(y / rect.height, 0), 1),
    });
  };

  // Update container dimensions when the container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect();
      setContainerDimensions({ width, height });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    const currentContainer = containerRef.current;
    resizeObserver.observe(currentContainer);

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      resizeObserver.disconnect();
    };
  }, []);

  // Load and process local images
  useEffect(() => {
    if (!hasLocalImages) {
      setLocalImagesLoaded(false);
      return;
    }

    // For single preview, load the first local image
    const localImageUrl = localImageSources[0].url;
    if (!localImageUrl) return;

    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const scaleFactor = isRetina ? 2 : 1;

      // Only update dimensions if server images aren't loaded yet
      if (!serverImagesLoaded) {
        setDimensions({
          width: Math.max(naturalWidth / scaleFactor, 1),
          height: Math.max(naturalHeight / scaleFactor, 1),
        });
      }

      setLocalImagesLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load local image:", localImageUrl);
      setLocalImagesLoaded(false);
    };

    img.src = localImageUrl;
  }, [localImageSources, isRetina, serverImagesLoaded, hasLocalImages]);

  // Load and process server images
  useEffect(() => {
    if (!hasServerImages) {
      setServerImagesLoaded(false);
      return;
    }

    // For single preview, load the first server image
    const serverImageUrl = serverImageSources[0].url;
    if (!serverImageUrl) return;

    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const scaleFactor = isRetina ? 2 : 1;

      // Always update dimensions for server images
      setDimensions({
        width: Math.max(naturalWidth / scaleFactor, 1),
        height: Math.max(naturalHeight / scaleFactor, 1),
      });

      setServerImagesLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load server image:", serverImageUrl);
      setServerImagesLoaded(false);
    };

    img.src = serverImageUrl;
  }, [serverImageSources, isRetina, hasServerImages]);

  // Load and process placeholder image
  useEffect(() => {
    if (!placeholderImagePreview || dimensions.width > 0) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const scaleFactor = isRetina ? 2 : 1;

      // Only set dimensions if no other images have set them yet
      if (dimensions.width === 0) {
        setDimensions({
          width: Math.max(naturalWidth / scaleFactor, 1),
          height: Math.max(naturalHeight / scaleFactor, 1),
        });
      }
    };

    img.onerror = () => {
      console.error(
        "Failed to load placeholder image:",
        placeholderImagePreview,
      );
    };

    img.src = placeholderImagePreview;
  }, [placeholderImagePreview, isRetina, dimensions.width]);

  // Shadow DOM state for HTML content isolation
  const shadowRootRef = useRef<ShadowRoot | null>(null);

  // Set dimensions from elementDimensions prop when available (for HTML content)
  useEffect(() => {
    if (hasHtmlContent && elementDimensions) {
      //
      setDimensions({
        width: elementDimensions.width,
        height: elementDimensions.height,
      });
    }
  }, [hasHtmlContent, elementDimensions]); // Remove dimensions from deps to prevent loop

  // Track when HTML content ref becomes ready
  useEffect(() => {
    if (hasHtmlContent && htmlContentRef.current && !htmlContentRefReady) {
      setHtmlContentRefReady(true);
    } else if (!hasHtmlContent && htmlContentRefReady) {
      setHtmlContentRefReady(false);
    }
  }, [hasHtmlContent, htmlContentRefReady]); // Run when HTML content or ref ready state changes

  // Create and manage Shadow DOM for HTML content isolation
  // This useEffect runs when the ref becomes ready
  useEffect(() => {
    if (!hasHtmlContent || !htmlContent || !htmlContentRefReady) {
      return;
    }

    // Always clean up previous shadow DOM when content changes
    if (shadowRootRef.current) {
      shadowRootRef.current = null;
    }

    if (!htmlContentRef.current) {
      return;
    }

    // Create fresh shadow DOM every time to avoid stale references
    const createShadowDOM = () => {
      const shadowHost = htmlContentRef.current;
      if (!shadowHost || !shadowHost.isConnected) {
        console.warn(
          "[ImagePreview] Shadow host not available or not connected",
        );
        return;
      }

      // Check if shadow root already exists and clear it safely
      if (shadowHost.shadowRoot) {
        shadowHost.shadowRoot.innerHTML = "";
        shadowRootRef.current = shadowHost.shadowRoot;
      } else {
        // Create fresh shadow root
        try {
          shadowRootRef.current = shadowHost.attachShadow({
            mode: "open",
          });
        } catch (error) {
          console.error("[ImagePreview] Failed to create shadow root:", error);
          return;
        }
      }

      const shadowRoot = shadowRootRef.current;
      if (!shadowRoot) {
        console.error("[ImagePreview] Failed to create shadow root");
        return;
      }

      // Create fresh container with isolated styles
      const container = document.createElement("div");
      container.style.cssText = `
                all: initial;
                display: block;
                width: 100%;
                height: 100%;
                overflow: visible;
                font-family: inherit;
                color: inherit;
                background: transparent;
                box-sizing: border-box;
                transform-origin: top left;
                position: relative;
                max-width: none;
                max-height: none;
            `;
      shadowRoot.appendChild(container);

      // Update the HTML content
      container.innerHTML = htmlContent;

      // Measure dimensions after content is rendered
      const measureDimensions = () => {
        if (!container.isConnected) {
          console.warn(
            "[ImagePreview] Container disconnected during measurement",
          );
          return;
        }

        // Use provided element dimensions if available, otherwise measure
        if (elementDimensions) {
          setDimensions({
            width: elementDimensions.width,
            height: elementDimensions.height,
          });
          return;
        }

        // Fallback to measuring if no element dimensions provided
        const rect = container.getBoundingClientRect();
        const scrollWidth = container.scrollWidth;
        const scrollHeight = container.scrollHeight;

        // Use the larger of the two measurements to ensure we capture the full content
        const contentWidth = Math.max(rect.width, scrollWidth);
        const contentHeight = Math.max(rect.height, scrollHeight);

        // Apply retina scaling like images do for consistency
        const scaleFactor = isRetina ? 2 : 1;
        const naturalWidth = Math.max(contentWidth / scaleFactor, 100);
        const naturalHeight = Math.max(contentHeight / scaleFactor, 50);

        setDimensions({
          width: naturalWidth,
          height: naturalHeight,
        });
      };

      // Use multiple animation frames to ensure content is fully rendered
      // This helps with complex HTML content that might need time to layout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Wait one more frame to ensure all styles are applied
          requestAnimationFrame(measureDimensions);
        });
      });
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(createShadowDOM);

    // Cleanup function - always clean up shadow DOM safely
    return () => {
      // Clear shadow root reference but don't manipulate DOM during React cleanup
      if (shadowRootRef.current) {
        try {
          // Only clear content if the shadow root is still connected
          if (
            shadowRootRef.current.host &&
            shadowRootRef.current.host.isConnected
          ) {
            shadowRootRef.current.innerHTML = "";
          }
        } catch (error) {
          console.warn(
            "[ImagePreview] Error during shadow DOM cleanup:",
            error,
          );
        }
        shadowRootRef.current = null;
      }
    };
  }, [
    hasHtmlContent,
    htmlContent,
    dimensions.width,
    dimensions.height,
    isRetina,
    htmlContentRefReady, // Re-run when ref becomes available
    elementDimensions, // Re-run when element dimensions change
  ]); // Re-run when HTML content changes or ref becomes available

  // Measure HTML content dimensions when htmlContent changes (fallback for non-shadow DOM)
  useEffect(() => {
    if (!hasHtmlContent || !htmlContentRef.current || shadowRootRef.current) {
      return;
    }

    // Use provided element dimensions if available
    if (elementDimensions) {
      setDimensions({
        width: elementDimensions.width,
        height: elementDimensions.height,
      });
      return;
    }

    // Fallback to measuring if no element dimensions provided
    const measureElement = document.createElement("div");
    measureElement.innerHTML = htmlContent;
    measureElement.style.position = "absolute";
    measureElement.style.visibility = "hidden";
    measureElement.style.top = "-9999px";
    measureElement.style.left = "-9999px";
    measureElement.style.width = "auto";
    measureElement.style.height = "auto";
    // Ensure the element can expand to its natural size
    measureElement.style.maxWidth = "none";
    measureElement.style.maxHeight = "none";
    measureElement.style.whiteSpace = "nowrap"; // Prevent text wrapping for accurate measurement

    document.body.appendChild(measureElement);

    // Get the natural dimensions using multiple measurement methods
    const rect = measureElement.getBoundingClientRect();
    const scrollWidth = measureElement.scrollWidth;
    const scrollHeight = measureElement.scrollHeight;

    // Use the larger of the measurements to ensure we capture the full content
    const contentWidth = Math.max(rect.width, scrollWidth);
    const contentHeight = Math.max(rect.height, scrollHeight);

    // Apply retina scaling like images do for consistency
    const scaleFactor = isRetina ? 2 : 1;
    const naturalWidth = Math.max(contentWidth / scaleFactor, 100); // Minimum width
    const naturalHeight = Math.max(contentHeight / scaleFactor, 50); // Minimum height

    // Clean up
    document.body.removeChild(measureElement);

    // Set dimensions for HTML content
    setDimensions({
      width: naturalWidth,
      height: naturalHeight,
    });
  }, [hasHtmlContent, htmlContent, isRetina, elementDimensions]);

  // Determine content visibility
  // When HTML content is provided (Styled/Complete mode), prioritize it over images
  const showSingleImageContent =
    !hasHtmlContent && // Hide images when HTML content is available
    singleDisplaySource &&
    dimensions.width > 0 &&
    dimensions.height > 0 &&
    (type === "component" ||
      (type === "page" &&
        (!multiSectionSources || multiSectionSources.length <= 1)));

  const showMultiSectionContent =
    !hasHtmlContent && // Hide multi-section images when HTML content is available
    type === "page" &&
    multiSectionSources &&
    multiSectionSources.length > 1;

  // Check if we have any image content to display
  const hasAnyImageContent =
    showSingleImageContent ||
    showMultiSectionContent ||
    !!placeholderImagePreview ||
    hasHtmlContent;

  // Debug logging for visibility decisions (can be removed in production)
  //

  // Determine if placeholder should be shown
  // (show during loading or if explicitly specified as the only source)
  // Don't show placeholder when HTML content is available
  const showPlaceholder =
    !hasHtmlContent && // Hide placeholder when HTML content is available
    !!placeholderImagePreview &&
    ((!hasServerImages && !hasLocalImages) || isLoading);

  // Handle placeholder click - try to find and click ElementSelectButton
  const handlePlaceholderClick = () => {
    if (onPlaceholderClick) {
      onPlaceholderClick();
      return;
    }

    // Try to find and click ElementSelectButton within the placeholder content
    // This is a fallback for cases where onPlaceholderClick is not provided
    const elementSelectButton = document.querySelector(
      '.image-preview .image-state button[class*="element-select"]',
    ) as HTMLButtonElement;

    if (elementSelectButton) {
      elementSelectButton.click();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes spinner-rotate {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
          width: "100%",
          borderRadius: type === "page" ? "8px" : "4px",
          background: level === 1 ? "#eeeeee" : "#f6f9fc",
          ...(type === "component" && {
            height: "144px",
            padding: "4px",
          }),
          ...(type === "page" && {
            aspectRatio: "16/9",
            border: "3px solid #e0e0e0",
          }),
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={containerRef}
      >
        {/* Placeholder content state (when no images available) */}
        {!hasAnyImageContent && placeholderContent && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: level === 1 ? "#eeeeee" : "#f6f9fc",
              borderRadius: "4px",
              padding: "0 24px",
              zIndex: 10,
              cursor:
                onPlaceholderClick ||
                (!hasServerImages &&
                  !hasLocalImages &&
                  !placeholderImagePreview)
                  ? "pointer"
                  : "default",
              transition: "background-color 0.2s ease",
            }}
            onClick={handlePlaceholderClick}
            onMouseEnter={() => setIsPlaceholderHovered(true)}
            onMouseLeave={() => setIsPlaceholderHovered(false)}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                background: isPlaceholderHovered
                  ? level === 1
                    ? "rgba(180, 180, 180, 0.15)"
                    : "rgba(204, 204, 204, 0.2)"
                  : "rgba(204, 204, 204, 0.15)",
                boxShadow: isPlaceholderHovered
                  ? "0 2px 8px rgba(0, 0, 0, 0.15)"
                  : "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {placeholderContent}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(246, 249, 252, 0.8)",
              backdropFilter: "blur(2px)",
              borderRadius: "4px",
              zIndex: 10,
              transition: "opacity 0.2s ease",
            }}
          >
            <LoadingSpinner description="Doing Magic..." />
          </div>
        )}

        {/* Local images layer (behind server images) */}
        {hasLocalImages &&
          !isLoading &&
          showSingleImageContent &&
          (() => {
            const scale = isHovered && !smallerThanContainer ? 1 : fitScale;
            const opacity = hasServerImages && serverImagesLoaded ? 0 : 1;

            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  opacity,
                  zIndex: hasServerImages ? 1 : 2,
                  transition: "opacity 0.3s ease",
                }}
              >
                {type === "component" ||
                (type === "page" && localImageSources.length <= 1) ? (
                  // Single local image
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${dimensions.width}px`,
                      height: `${dimensions.height}px`,
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${scale})`,
                      transformOrigin,
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    <img
                      src={localImageSources[0].url}
                      alt="Local preview"
                      onClick={onImageClick}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                ) : showMultiSectionContent ? (
                  // Multi-section local images
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {localImageSources.map((source, index) => (
                      <img
                        key={`local_section_${index}`}
                        src={source.url}
                        alt={`Section ${source.section || index + 1}`}
                        onClick={onImageClick}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          cursor: "pointer",
                        }}
                        onError={(e) => {
                          console.error(
                            "Error loading local image section:",
                            source.url,
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })()}

        {/* Placeholder image layer (blurred version that shows during loading) */}
        {showPlaceholder &&
          (() => {
            const opacity =
              (hasServerImages && serverImagesLoaded) ||
              (hasLocalImages && localImagesLoaded && !hasServerImages)
                ? 0
                : 1;

            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  background: "#eeeeee",
                  opacity: opacity * 0.8,
                  zIndex: 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width:
                      dimensions.width > 0 ? `${dimensions.width}px` : "auto",
                    height:
                      dimensions.height > 0 ? `${dimensions.height}px` : "auto",
                    transform: `translate(${centeredPosition.x}px, ${centeredPosition.y}px) scale(${fitScale})`,
                    transformOrigin: "center center",
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <img
                    src={placeholderImagePreview}
                    alt="Image placeholder"
                    onClick={onImageClick}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </div>
            );
          })()}

        {/* Server images layer (top layer) */}
        {hasServerImages &&
          !isLoading &&
          showSingleImageContent &&
          (() => {
            const scale = isHovered && !smallerThanContainer ? 1 : fitScale;
            const opacity = serverImagesLoaded ? 1 : 0;

            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  opacity,
                  zIndex: 3,
                  transition: "opacity 0.3s ease",
                }}
              >
                {type === "component" ||
                (type === "page" && serverImageSources.length <= 1) ? (
                  // Single server image
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: `${dimensions.width}px`,
                      height: `${dimensions.height}px`,
                      transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${scale})`,
                      transformOrigin,
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    <img
                      src={serverImageSources[0].url}
                      alt="Server image"
                      ref={imageRef}
                      onClick={onImageClick}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
                      onLoad={() => {
                        // Additional safeguard to ensure dimensions are updated
                        if (imageRef.current && dimensions.width === 0) {
                          const { width, height } = imageRef.current;
                          if (width > 0 && height > 0) {
                            setDimensions({
                              width: isRetina ? width / 2 : width,
                              height: isRetina ? height / 2 : height,
                            });
                          }
                        }
                      }}
                    />
                  </div>
                ) : showMultiSectionContent ? (
                  // Multi-section server images
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    {serverImageSources.map((source, index) => (
                      <img
                        key={`server_section_${index}`}
                        src={source.url}
                        alt={`Section ${source.section || index + 1}`}
                        onClick={onImageClick}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          cursor: "pointer",
                        }}
                        onError={(e) => {
                          console.error(
                            "Error loading server image section:",
                            source.url,
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })()}

        {/* HTML content layer (for full-element fidelity mode) */}
        {hasHtmlContent &&
          !isLoading &&
          (() => {
            const scale = isHovered && !smallerThanContainer ? 1 : fitScale;

            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  zIndex: 4,
                  opacity: 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${scale})`,
                    transformOrigin,
                    transition: "transform 0.3s ease-out",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div
                    ref={htmlContentRef}
                    onClick={onImageClick}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transformStyle: "preserve-3d",
                      backfaceVisibility: "hidden",
                      maxWidth: "none",
                      maxHeight: "none",
                      overflow: "visible",
                    }}
                    key={`shadow-host-${htmlContent?.length || 0}-${
                      htmlContent
                        ?.substring(0, 50)
                        .replace(/[^a-zA-Z0-9]/g, "") || "empty"
                    }`}
                  />
                </div>
              </div>
            );
          })()}

        {/* Status content (bottom left) */}
        {statusContent && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              zIndex: 20,
            }}
          >
            {statusContent}
          </div>
        )}

        {/* Controls content (top right) */}
        {controlsContent && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 9,
              display: "flex",
              gap: "4px",
            }}
          >
            {controlsContent}
          </div>
        )}
      </div>
    </>
  );
};

export default ImagePreview;
