import { createContext, useContext, useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { loadPrivateImage, privateMediaPrefix } from "@/lib/supabase";

export const PreviewToken = createContext<string | undefined>(undefined);
export function EditorialImage({
  src,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const token = useContext(PreviewToken);
  const [loaded, setLoaded] = useState<{
    src: string;
    url: string;
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
    if (!privateSrc) return;
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
      .catch(() => {});
    return () => {
      abort.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [privateSrc, token]);
  return (
    <img
      {...props}
      src={
        privateSrc
          ? loaded?.src === privateSrc && loaded.token === token
            ? loaded.url
            : undefined
          : src
      }
    />
  );
}
