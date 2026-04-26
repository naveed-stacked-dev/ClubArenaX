import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable drag-and-drop image upload component with preview.
 *
 * @param {Object} props
 * @param {string|File} props.value - Current image URL or File object
 * @param {function} props.onChange - Called with the new File or URL after drop or removal
 * @param {string} props.label - Label text
 * @param {string} props.className - Extra container classes
 * @param {number} props.maxSizeMB - Max file size in MB (default 5)
 * @param {string} props.aspectHint - Hint text for aspect ratio, e.g. "1:1", "16:9"
 */
export default function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  className,
  maxSizeMB = 5,
  aspectHint,
}) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Generate preview URL if value is a File
  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles?.length > 0) {
        const rej = rejectedFiles[0];
        if (rej.errors?.[0]?.code === "file-too-large") {
          setError(`File too large. Max size: ${maxSizeMB}MB`);
        } else {
          setError(rej.errors?.[0]?.message || "Invalid file");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      onChange(file);
    },
    [onChange, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif", ".svg"] },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
  };

  const displayUrl = preview;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
          {label}
          {aspectHint && (
            <span className="text-xs text-muted-foreground font-normal">({aspectHint})</span>
          )}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden",
          isDragActive
            ? "border-violet-500 bg-violet-500/5"
            : displayUrl
            ? "border-border bg-secondary/20"
            : "border-border hover:border-muted-foreground/40 bg-secondary/10 hover:bg-secondary/20"
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {displayUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group"
            >
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                <span className="text-white text-xs font-medium">Click or drag to replace</span>
              </div>
              {/* Remove button */}
              {value && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-white shadow-lg hover:bg-destructive/80 transition-colors z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 px-4 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-sm text-foreground font-medium">
                {isDragActive ? "Drop your image here..." : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP, GIF up to {maxSizeMB}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
