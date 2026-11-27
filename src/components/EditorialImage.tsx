import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { loadPrivateImage, privateMediaPrefix } from "@/lib/supabase";

export const PreviewToken = createContext<string | undefined>(undefined);
export function EditorialImage({
  src,
  fallbackSrc,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const token = useContext(PreviewToken);
  const image = useRef<HTMLImageElement>(null);
  const [approaching, setApproaching] = useState(false);
  const [loaded, setLoaded] = useState<{
    src: string;
    url?: string;
    token?: string;
  }>();
  const privateSrc =
    src?.startsWith(privateMediaPrefix) &&
    /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(
      src.slice(privateMediaPrefix.length),
    )
      ? src
      : undefined;
  useEffect(() => {
    if (!privateSrc || props.loading !== "lazy" || approaching) return;
    const element = image.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setApproaching(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setApproaching(true);
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [approaching, privateSrc, props.loading]);
  const shouldLoad = props.loading !== "lazy" || approaching;
  useEffect(() => {
    if (!privateSrc || !shouldLoad) return;
    const abort = new AbortController();
    let url: string | undefined;
    loadPrivateImage(
      privateSrc.replace(
        "/storage/v1/object/x1-editorial/",
        "/storage/v1/object/authenticated/x1-editorial/",
      ),
      token,
      abort.signal,
    )
      .then((blob) => {
        if (abort.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setLoaded({ src: privateSrc, url, token });
      })
      .catch(() => {
        if (!abort.signal.aborted) setLoaded({ src: privateSrc, token });
      });
    return () => {
      abort.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [privateSrc, shouldLoad, token]);
  return (
    <img
      {...props}
      ref={image}
      src={
        privateSrc
          ? loaded?.src === privateSrc && loaded.token === token
            ? loaded.url ?? fallbackSrc
            : undefined
          : src
      }
    />
  );
}
