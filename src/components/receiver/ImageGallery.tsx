
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex: number;
  itemName: string;
}

export const ImageGallery = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  itemName
}: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-gray-900 mx-auto w-full sm:w-11/12 md:w-10/12 lg:w-9/12">
        <div className="relative h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-2 bg-gray-800 text-white">
            <p className="text-sm truncate pl-2">
              {itemName} - Image {currentIndex + 1} of {images.length}
            </p>
            <DialogClose asChild>
              <button className="p-1 hover:bg-gray-700 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>
          
          {/* Image container */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <img
              src={images[currentIndex]}
              alt={`${itemName} image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          {/* Navigation controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
