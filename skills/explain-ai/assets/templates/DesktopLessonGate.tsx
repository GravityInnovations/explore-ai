import { useEffect, useState, type ReactNode } from "react";

export const MIN_LESSON_WIDTH = 768;

export function isDesktopLessonWidth(width: number) {
  return Number.isFinite(width) && width >= MIN_LESSON_WIDTH;
}

/** Keep the heavy lesson renderer behind this width branch. */
export function DesktopLessonGate({
  children,
  message = "This lesson is designed for a desktop or laptop. Please open it on a wider screen.",
}: {
  children: () => ReactNode;
  message?: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  if (!isDesktopLessonWidth(width))
    return <p role="status">{message}</p>;
  return <>{children()}</>;
}
