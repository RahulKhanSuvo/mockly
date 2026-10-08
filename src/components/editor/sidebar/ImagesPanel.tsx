"use client";

import { useState } from "react";
import { Image as ImageIcon, Search, Loader2 } from "lucide-react";
import { useCanvasStore } from "@/store/canvasStore";
import Image from "next/image";

type UnsplashPhoto = {
  id: string;

  urls: {
    small: string;
    regular: string;
  };

  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };

  links: {
    download_location: string;
  };
};

export function ImagesPanel() {
  const { selectedFrameId, addImageToFrame } = useCanvasStore();

  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------
  // SEARCH UNSPLASH
  // ------------------------------------------

  const searchImages = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/unsplash?query=${encodeURIComponent(trimmedQuery)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setPhotos(data.results ?? []);
      setSearched(true);
    } catch (error) {
      console.error(error);

      setError("Could not search Unsplash.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------
  // ADD IMAGE TO FRAME
  // ------------------------------------------

  const handleAddImage = async (photo: UnsplashPhoto) => {
    if (!selectedFrameId) return;

    /*
     * Tell Unsplash that the user selected
     * the photo.
     */
    try {
      await fetch("/api/unsplash/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          downloadLocation: photo.links.download_location,
        }),
      });
    } catch (error) {
      /*
       * Download tracking failing should not
       * prevent the user from using the image.
       */
      console.error("Unsplash download tracking failed:", error);
    }

    /*
     * Add the actual Unsplash image to your
     * selected Mockly frame.
     */
    addImageToFrame(
      selectedFrameId,
      photo.urls.regular
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">

      {/* -------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------- */}

      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-neutral-800">
          Photos by Unsplash
        </h3>

        <p className="text-xs text-neutral-500 leading-relaxed">
          {selectedFrameId
            ? "Search and click a photo to add it to your selected frame."
            : "Select a frame on the canvas first to add a photo."}
        </p>
      </div>

      {/* -------------------------------------- */}
      {/* SEARCH */}
      {/* -------------------------------------- */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          searchImages();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-neutral-200 bg-white text-sm outline-none focus:border-neutral-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-9 px-3 rounded-lg bg-neutral-900 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </form>

      {/* -------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------- */}

      {error && (
        <div className="text-xs text-red-500">
          {error}
        </div>
      )}

      {/* -------------------------------------- */}
      {/* RESULTS */}
      {/* -------------------------------------- */}

      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Initial state */}

        {!searched && !loading && (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-center px-4">
            <ImageIcon className="w-8 h-8 text-neutral-300 mb-3" />

            <p className="text-sm text-neutral-500">
              Search for photos
            </p>

            <p className="text-xs text-neutral-400 mt-1">
              Try &quot;office&quot;, &quot;nature&quot;, &quot;people&quot;, or &quot;technology&quot;.
            </p>
          </div>
        )}

        {/* No results */}

        {searched && !loading && photos.length === 0 && !error && (
          <div className="h-full min-h-40 flex items-center justify-center text-sm text-neutral-400">
            No photos found.
          </div>
        )}

        {/* Photos */}

        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pb-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                disabled={!selectedFrameId}
                onClick={() => handleAddImage(photo)}
                title={
                  selectedFrameId
                    ? `Photo by ${photo.user.name}`
                    : "Select a frame first"
                }
                className={`
                  relative
                  w-full
                  aspect-square
                  rounded-lg
                  overflow-hidden
                  border
                  group
                  ${
                    selectedFrameId
                      ? "border-transparent hover:ring-2 hover:ring-brand-primary transition-all cursor-pointer"
                      : "border-neutral-200 opacity-50 cursor-not-allowed"
                  }
                `}
              >
               <Image
  src={photo.urls.small}
  alt={`Photo by ${photo.user.name}`}
  fill
  sizes="(max-width: 768px) 50vw, 200px"
  className="
    object-cover
    bg-neutral-100
    transition-transform
    duration-200
    group-hover:scale-105
  "
/>

                {/* Photographer */}

                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-black/50 text-white text-[10px] text-left truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  Photo by {photo.user.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------- */}
      {/* FOOTER */}
      {/* -------------------------------------- */}

      <div className="pt-3 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400">
        <ImageIcon className="w-3.5 h-3.5" />

        <span>
          Photos provided by Unsplash
        </span>
      </div>
    </div>
  );
}